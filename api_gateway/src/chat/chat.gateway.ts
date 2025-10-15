import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, OnModuleInit } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  SendMessageDto,
  JoinRoomDto,
  LeaveRoomDto,
  ChatEventDto,
  MessageType,
} from './dto/chat.dto';
import { ChatMessageDocument } from './schemas/chat-message.schema';
import { WebSocketSecurityGuard } from './security/websocket-security.guard';
import { AuditLoggerService } from './security/audit-logger.service';

@WebSocketGateway({
  namespace: '/api/v1/chat',
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? [
            'https://vaoluoitv.com',
            'https://www.vaoluoitv.com',
            'https://members.vaoluoitv.com',
          ]
        : [
            'http://localhost:8080',
            'http://localhost:3000',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:3000',
          ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<
    string,
    { socketId: string; username: string; matchId: string }
  >();

  constructor(
    private readonly chatService: ChatService,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async onModuleInit() {
    // Subscribe to Redis channels for cross-instance communication
    await this.setupRedisSubscriptions();
  }

  private async setupRedisSubscriptions() {
    try {
      // Subscribe to all chat channels (wildcard pattern)
      await this.chatService.subscribeToRedis(
        'chat:*',
        (data: ChatEventDto) => {
          this.logger.log(`Received Redis message: ${JSON.stringify(data)}`);

          // Broadcast the event to all connected clients in the match room
          void this.broadcastEvent(data);
        },
      );

      this.logger.log('Redis subscriptions setup completed');
    } catch (error) {
      this.logger.error(
        `Failed to setup Redis subscriptions: ${error.message}`,
      );
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Join client to a default room for general notifications
    void client.join('general');
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove user from connected users map
    for (const [userId, userInfo] of this.connectedUsers.entries()) {
      if (userInfo.socketId === client.id) {
        this.connectedUsers.delete(userId);

        // Notify room that user left
        if (userInfo.matchId) {
          const leaveEvent: ChatEventDto = {
            type: MessageType.USER_LEFT,
            matchId: userInfo.matchId,
            userId,
            username: userInfo.username,
            timestamp: new Date().toISOString(),
          };

          this.server
            .to(`match:${userInfo.matchId}`)
            .emit('chat_event', leaveEvent);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { matchId, username } = joinRoomDto;
      const userId = client.handshake.auth?.userId || client.id; // Fallback to socket ID
      const isAnonymous =
        userId === 'anonymous' || !client.handshake.auth?.userId;

      // Check if user is kicked from this match
      // For anonymous users, check by display name if available
      let checkUserId = userId;
      if (isAnonymous && username) {
        checkUserId = `anonymous:${username}`;
      }

      const kickInfo = await this.chatService.getKickInfo(checkUserId, matchId);
      if (kickInfo) {
        this.logger.warn(
          `Kicked user ${checkUserId} attempted to join match ${matchId}`,
        );

        // Emit kick event to client with actual reason
        client.emit('user_kicked', {
          type: 'USER_KICKED',
          message: 'You have been kicked from this chat.',
          matchId,
          reason: kickInfo.reason || 'No reason provided',
          adminId: kickInfo.adminId,
          timestamp: kickInfo.timestamp,
        });

        return {
          success: false,
          message: 'You have been kicked from this chat',
          kicked: true,
          reason: kickInfo.reason || 'No reason provided',
          adminId: kickInfo.adminId,
          timestamp: kickInfo.timestamp,
        };
      }

      // Check if user is banned from this match
      const banInfo = await this.chatService.getBanInfo(checkUserId, matchId);
      if (banInfo) {
        this.logger.warn(
          `Banned user ${checkUserId} attempted to join match ${matchId}`,
        );

        // Emit ban event to client with actual reason
        client.emit('user_banned', {
          type: 'USER_BANNED',
          message: 'You are banned from this chat.',
          matchId,
          reason: banInfo.reason || 'No reason provided',
          expiresAt: banInfo.expiresAt,
        });

        return {
          success: false,
          message: 'You are banned from this chat',
          banned: true,
          reason: banInfo.reason || 'No reason provided',
          expiresAt: banInfo.expiresAt,
        };
      }

      // Leave previous room if any
      const previousUser = Array.from(this.connectedUsers.values()).find(
        (user) => user.socketId === client.id,
      );
      if (previousUser) {
        client.leave(`match:${previousUser.matchId}`);
      }

      // Join new room
      client.join(`match:${matchId}`);

      // Update connected users map
      this.connectedUsers.set(userId, {
        socketId: client.id,
        username: username || 'Anonymous',
        matchId,
      });

      // Notify room that user joined
      const joinEvent: ChatEventDto = {
        type: MessageType.USER_JOINED,
        matchId,
        userId,
        username: username || 'Anonymous',
        timestamp: new Date().toISOString(),
      };

      this.server.to(`match:${matchId}`).emit('chat_event', joinEvent);

      this.logger.log(`User ${username} joined match ${matchId}`);

      return {
        success: true,
        message: `Joined match ${matchId}`,
        userId,
        username: username || 'Anonymous',
      };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      return {
        success: false,
        message: 'Failed to join room',
      };
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() leaveRoomDto: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { matchId } = leaveRoomDto;
      const userId = client.handshake.auth?.userId || client.id;

      client.leave(`match:${matchId}`);

      // Remove from connected users map
      const userInfo = this.connectedUsers.get(userId);
      if (userInfo) {
        this.connectedUsers.delete(userId);

        // Notify room that user left
        const leaveEvent: ChatEventDto = {
          type: MessageType.USER_LEFT,
          matchId,
          userId,
          username: userInfo.username,
          timestamp: new Date().toISOString(),
        };

        this.server.to(`match:${matchId}`).emit('chat_event', leaveEvent);
      }

      this.logger.log(`User left match ${matchId}`);

      return {
        success: true,
        message: `Left match ${matchId}`,
      };
    } catch (error) {
      this.logger.error(`Error leaving room: ${error.message}`);
      return {
        success: false,
        message: 'Failed to leave room',
      };
    }
  }

  @SubscribeMessage('send_message')
  @UseGuards(WebSocketSecurityGuard)
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.handshake.auth?.userId || client.id;
      const userRole = client.handshake.auth?.userRole;

      // Save message to database
      const savedMessage = (await this.chatService.sendMessage(
        sendMessageDto,
        userId,
        userRole,
      )) as ChatMessageDocument;

      // Create chat event
      const chatEvent: ChatEventDto = {
        type: MessageType.MESSAGE,
        matchId: sendMessageDto.matchId,
        userId,
        username: savedMessage.username || 'Anonymous',
        display_name: savedMessage.display_name,
        message: sendMessageDto.message,
        messageId: (savedMessage._id as any).toString(),
        avatar: sendMessageDto.avatar,
        userType: savedMessage.userType,
        timestamp: savedMessage.timestamp.toISOString(),
      };

      // Broadcast to all clients in the match room
      this.server
        .to(`match:${sendMessageDto.matchId}`)
        .emit('chat_event', chatEvent);

      this.logger.log(
        `Message sent in match ${sendMessageDto.matchId} by user ${userId}`,
      );

      return {
        success: true,
        message: 'Message sent successfully',
        messageId: (savedMessage._id as any).toString(),
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return {
        success: false,
        message: 'Failed to send message',
      };
    }
  }

  // Method to broadcast events from Redis
  async broadcastEvent(event: ChatEventDto) {
    // Handle special events that require additional processing
    if (event.type === MessageType.USER_KICKED) {
      // Find and disconnect the kicked user
      const kickedUser = this.connectedUsers.get(event.userId);
      if (kickedUser) {
        const socket = this.server.sockets.sockets.get(kickedUser.socketId);
        if (socket) {
          // Emit kick event to the specific user first
          socket.emit('user_kicked', {
            type: 'USER_KICKED',
            message: 'You have been kicked from this chat.',
            matchId: event.matchId,
            reason: event.reason || 'No reason provided',
            adminId: event.adminId,
            timestamp: event.timestamp,
          });

          // Disconnect the socket
          socket.disconnect(true);

          // Remove from connected users map
          this.connectedUsers.delete(event.userId);

          this.logger.log(`User ${event.userId} disconnected due to kick`);
        }
      }
    }

    // Broadcast to all users in the match room
    this.server.to(`match:${event.matchId}`).emit('chat_event', event);
  }

  // Get connected users for a specific match
  getConnectedUsers(matchId: string): string[] {
    return Array.from(this.connectedUsers.entries())
      .filter(([_, userInfo]) => userInfo.matchId === matchId)
      .map(([userId, _]) => userId);
  }

  // Get total connected users
  getTotalConnectedUsers(): number {
    return this.connectedUsers.size;
  }
}
