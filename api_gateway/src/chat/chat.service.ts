import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';
import {
  SendMessageDto,
  GetMessagesDto,
  ModerateMessageDto,
  DeleteMessageDto,
  ChatEventDto,
  MessageType,
  BanUserDto,
  MuteUserDto,
  KickUserDto,
  UnbanUserDto,
  UnmuteUserDto,
  UnkickUserDto,
} from './dto/chat.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    private readonly usersService: UsersService,
    @Optional() @InjectRedis() private readonly redis?: Redis,
  ) {}

  async sendMessage(
    sendMessageDto: SendMessageDto,
    userId: string,
    userRole?: string,
  ): Promise<ChatMessage> {
    try {
      // Map user role to userType
      let userType: 'user' | 'moderator' | 'admin' = 'user';
      if (userRole === 'admin') {
        userType = 'admin';
      } else if (userRole === 'moderator') {
        userType = 'moderator';
      }

      // For anonymous users, use display name as username
      const username =
        sendMessageDto.isAnonymous && sendMessageDto.display_name
          ? sendMessageDto.display_name
          : sendMessageDto.username || 'Anonymous';

      // Get display_name from user profile if authenticated
      let displayName = sendMessageDto.display_name;
      if (!sendMessageDto.isAnonymous && userId !== 'anonymous') {
        try {
          const user = await this.usersService.findOne(userId);
          displayName = user.display_name || sendMessageDto.display_name;
        } catch (error) {
          this.logger.warn(`Failed to get user ${userId}: ${error.message}`);
          // Fallback to display_name from DTO if user not found
        }
      }

      const chatMessage = new this.chatMessageModel({
        ...sendMessageDto,
        userId,
        username,
        display_name: displayName,
        userType,
        timestamp: new Date(),
      });

      const savedMessage = await chatMessage.save();

      // Publish message to Redis for real-time distribution
      const chatEvent: ChatEventDto = {
        type: MessageType.MESSAGE,
        matchId: sendMessageDto.matchId,
        userId,
        username: username,
        display_name: displayName,
        message: sendMessageDto.message,
        messageId: (savedMessage._id as any).toString(),
        avatar: sendMessageDto.avatar,
        userType,
        timestamp: savedMessage.timestamp.toISOString(),
      };

      await this.publishToRedis(`chat:${sendMessageDto.matchId}`, chatEvent);

      this.logger.log(
        `Message sent by user ${userId} in match ${sendMessageDto.matchId}`,
      );
      return savedMessage;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw error;
    }
  }

  async getMessages(getMessagesDto: GetMessagesDto): Promise<ChatMessage[]> {
    try {
      const query: any = {
        matchId: getMessagesDto.matchId,
        isDeleted: false,
      };

      if (getMessagesDto.before) {
        query.timestamp = { $lt: new Date(getMessagesDto.before) };
      }

      const messages = await this.chatMessageModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(getMessagesDto.limit || 50)
        .exec();

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      throw error;
    }
  }

  async moderateMessage(
    moderateMessageDto: ModerateMessageDto,
    moderatorId: string,
  ): Promise<ChatMessage> {
    try {
      const message = await this.chatMessageModel.findById(
        moderateMessageDto.messageId,
      );
      if (!message) {
        throw new Error('Message not found');
      }

      message.isModerated = moderateMessageDto.isModerated;
      await message.save();

      // Publish moderation event
      const chatEvent: ChatEventDto = {
        type: MessageType.MESSAGE_MODERATED,
        matchId: message.matchId,
        userId: message.userId,
        username: message.username,
        messageId: (message._id as any).toString(),
        reason: moderateMessageDto.reason,
        timestamp: new Date().toISOString(),
      };

      await this.publishToRedis(`chat:${message.matchId}`, chatEvent);

      this.logger.log(
        `Message ${moderateMessageDto.messageId} moderated by ${moderatorId}`,
      );
      return message;
    } catch (error) {
      this.logger.error(`Error moderating message: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(
    deleteMessageDto: DeleteMessageDto,
    deletedBy: string,
  ): Promise<ChatMessage> {
    try {
      const message = await this.chatMessageModel.findById(
        deleteMessageDto.messageId,
      );
      if (!message) {
        throw new Error('Message not found');
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      message.deletedBy = deletedBy;
      await message.save();

      // Publish deletion event
      const chatEvent: ChatEventDto = {
        type: MessageType.MESSAGE_DELETED,
        matchId: message.matchId,
        userId: message.userId,
        username: message.username,
        messageId: (message._id as any).toString(),
        reason: deleteMessageDto.reason,
        timestamp: new Date().toISOString(),
      };

      await this.publishToRedis(`chat:${message.matchId}`, chatEvent);

      this.logger.log(
        `Message ${deleteMessageDto.messageId} deleted by ${deletedBy}`,
      );
      return message;
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async publishToRedis(channel: string, data: any): Promise<void> {
    try {
      if (!this.redis) {
        this.logger.warn('Redis not available, skipping publish');
        return;
      }
      await this.redis.publish(channel, JSON.stringify(data));
    } catch (error) {
      this.logger.error(`Error publishing to Redis: ${error.message}`);
      throw error;
    }
  }

  async subscribeToRedis(
    channel: string,
    callback: (data: any) => void,
  ): Promise<void> {
    try {
      if (!this.redis) {
        this.logger.warn('Redis not available, skipping subscribe');
        return;
      }

      const subscriber = this.redis.duplicate();

      // Support wildcard patterns
      if (channel.includes('*')) {
        await subscriber.psubscribe(channel);
        subscriber.on('pmessage', (pattern, receivedChannel, message) => {
          if (pattern === channel) {
            try {
              const data = JSON.parse(message);
              callback(data);
            } catch (error) {
              this.logger.error(
                `Error parsing Redis message: ${error.message}`,
              );
            }
          }
        });
      } else {
        await subscriber.subscribe(channel);
        subscriber.on('message', (receivedChannel, message) => {
          if (receivedChannel === channel) {
            try {
              const data = JSON.parse(message);
              callback(data);
            } catch (error) {
              this.logger.error(
                `Error parsing Redis message: ${error.message}`,
              );
            }
          }
        });
      }

      this.logger.log(`Subscribed to Redis channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Error subscribing to Redis: ${error.message}`);
      throw error;
    }
  }

  async getUserMessageCount(userId: string, matchId: string): Promise<number> {
    try {
      return await this.chatMessageModel.countDocuments({
        userId,
        matchId,
        isDeleted: false,
      });
    } catch (error) {
      this.logger.error(`Error getting user message count: ${error.message}`);
      throw error;
    }
  }

  async getActiveUsers(matchId: string): Promise<string[]> {
    try {
      const activeUsers = await this.chatMessageModel.distinct('userId', {
        matchId,
        isDeleted: false,
        timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      });
      return activeUsers;
    } catch (error) {
      this.logger.error(`Error getting active users: ${error.message}`);
      throw error;
    }
  }

  // Admin User Management Methods
  async banUser(banUserDto: BanUserDto, adminId: string): Promise<any> {
    try {
      const {
        userId,
        matchId,
        username,
        reason,
        duration,
        isAnonymous,
        displayName,
        ipAddress,
      } = banUserDto;

      // Generate ban key based on user type
      let banKey: string;
      let targetUserId: string;

      if (isAnonymous && displayName && ipAddress) {
        // For anonymous users, use IP + display name combination
        const anonymousKey = `anonymous:${displayName}`;
        banKey = `chat_ban:${matchId}:${anonymousKey}`;
        targetUserId = `${ipAddress}:${displayName}`;
      } else {
        // For authenticated users, use userId
        banKey = `chat_ban:${matchId}:${userId}`;
        targetUserId = userId;
      }

      // Store ban info in Redis
      const banData = {
        userId: targetUserId,
        username: isAnonymous ? displayName : username || `user_${userId}`,
        matchId,
        adminId,
        reason: reason || 'No reason provided',
        duration: duration || 0, // 0 = permanent
        bannedAt: new Date().toISOString(),
        expiresAt: duration
          ? new Date(Date.now() + duration * 60 * 1000).toISOString()
          : null,
        isAnonymous: isAnonymous || false,
        ipAddress: ipAddress || null,
      };

      if (duration && duration > 0) {
        // Temporary ban
        await this.redis?.setex(banKey, duration * 60, JSON.stringify(banData));
      } else {
        // Permanent ban
        await this.redis?.set(banKey, JSON.stringify(banData));
      }

      // Publish ban event to Redis
      const banEvent: ChatEventDto = {
        type: MessageType.USER_BANNED,
        matchId,
        userId,
        username: username || `user_${userId}`,
        adminId,
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(banEvent),
      );

      this.logger.log(
        `User ${userId} banned from match ${matchId} by admin ${adminId}`,
      );

      return {
        success: true,
        message: 'User banned successfully',
        banData,
      };
    } catch (error) {
      this.logger.error(`Error banning user: ${error.message}`);
      throw error;
    }
  }

  async unbanUser(unbanUserDto: UnbanUserDto, adminId: string): Promise<any> {
    try {
      const { userId, matchId } = unbanUserDto;
      const username = `user_${userId}`;

      // Remove ban from Redis
      const banKey = `chat_ban:${matchId}:${userId}`;
      await this.redis?.del(banKey);

      // Publish unban event to Redis
      const unbanEvent: ChatEventDto = {
        type: MessageType.USER_UNBANNED,
        matchId,
        userId,
        username,
        adminId,
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(unbanEvent),
      );

      this.logger.log(
        `User ${userId} unbanned from match ${matchId} by admin ${adminId}`,
      );

      return {
        success: true,
        message: 'User unbanned successfully',
      };
    } catch (error) {
      this.logger.error(`Error unbanning user: ${error.message}`);
      throw error;
    }
  }

  async muteUser(muteUserDto: MuteUserDto, adminId: string): Promise<any> {
    try {
      const {
        userId,
        matchId,
        username,
        reason,
        duration,
        isAnonymous,
        displayName,
        ipAddress,
      } = muteUserDto;

      // Generate mute key based on user type
      let muteKey: string;
      let targetUserId: string;

      if (isAnonymous && displayName && ipAddress) {
        // For anonymous users, use IP + display name combination
        const anonymousKey = `anonymous:${displayName}`;
        muteKey = `chat_mute:${matchId}:${anonymousKey}`;
        targetUserId = `${ipAddress}:${displayName}`;
      } else {
        // For authenticated users, use userId
        muteKey = `chat_mute:${matchId}:${userId}`;
        targetUserId = userId;
      }

      // Store mute info in Redis
      const muteData = {
        userId: targetUserId,
        username: isAnonymous ? displayName : username || `user_${userId}`,
        matchId,
        adminId,
        reason: reason || 'No reason provided',
        duration: duration || 0, // 0 = permanent
        mutedAt: new Date().toISOString(),
        expiresAt: duration
          ? new Date(Date.now() + duration * 60 * 1000).toISOString()
          : null,
        isAnonymous: isAnonymous || false,
        ipAddress: ipAddress || null,
      };

      if (duration && duration > 0) {
        // Temporary mute
        await this.redis?.setex(
          muteKey,
          duration * 60,
          JSON.stringify(muteData),
        );
      } else {
        // Permanent mute
        await this.redis?.set(muteKey, JSON.stringify(muteData));
      }

      // Publish mute event to Redis
      const muteEvent: ChatEventDto = {
        type: MessageType.USER_MUTED,
        matchId,
        userId,
        username: username || `user_${userId}`,
        adminId,
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(muteEvent),
      );

      this.logger.log(
        `User ${userId} muted in match ${matchId} by admin ${adminId}`,
      );

      return {
        success: true,
        message: 'User muted successfully',
        muteData,
      };
    } catch (error) {
      this.logger.error(`Error muting user: ${error.message}`);
      throw error;
    }
  }

  async unmuteUser(
    unmuteUserDto: UnmuteUserDto,
    adminId: string,
  ): Promise<any> {
    try {
      const { userId, matchId } = unmuteUserDto;
      const username = `user_${userId}`;

      // Remove mute from Redis
      const muteKey = `chat_mute:${matchId}:${userId}`;
      await this.redis?.del(muteKey);

      // Publish unmute event to Redis
      const unmuteEvent: ChatEventDto = {
        type: MessageType.USER_UNMUTED,
        matchId,
        userId,
        username,
        adminId,
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(unmuteEvent),
      );

      this.logger.log(
        `User ${userId} unmuted in match ${matchId} by admin ${adminId}`,
      );

      return {
        success: true,
        message: 'User unmuted successfully',
      };
    } catch (error) {
      this.logger.error(`Error unmuting user: ${error.message}`);
      throw error;
    }
  }

  async kickUser(kickUserDto: KickUserDto, adminId: string): Promise<any> {
    try {
      const {
        userId,
        matchId,
        username,
        reason,
        duration,
        isAnonymous,
        displayName,
        ipAddress,
      } = kickUserDto;

      // Default kick duration: 15 minutes (kick should be temporary)
      const kickDuration = duration || 15;

      // Generate kick key based on user type
      let kickKey: string;
      let targetUserId: string;

      if (isAnonymous && displayName && ipAddress) {
        // For anonymous users, use IP + display name combination
        const anonymousKey = `anonymous:${displayName}`;
        kickKey = `chat_kick:${matchId}:${anonymousKey}`;
        targetUserId = `${ipAddress}:${displayName}`;
      } else {
        // For authenticated users, use userId
        kickKey = `chat_kick:${matchId}:${userId}`;
        targetUserId = userId;
      }

      // Store kick status in Redis for validation
      const kickData = {
        kicked: true,
        userId: targetUserId,
        username: isAnonymous ? displayName : username || `user_${userId}`,
        reason: reason || 'No reason provided',
        adminId,
        timestamp: new Date().toISOString(),
        duration: kickDuration,
        expiresAt: new Date(
          Date.now() + kickDuration * 60 * 1000,
        ).toISOString(), // Convert minutes to milliseconds
        isAnonymous: isAnonymous || false,
        ipAddress: ipAddress || null,
      };

      // Set TTL based on duration (kick should be temporary, max 2 hours)
      const ttlSeconds = Math.min(kickDuration * 60, 2 * 60 * 60); // Max 2 hours
      await this.redis?.setex(kickKey, ttlSeconds, JSON.stringify(kickData));

      // Publish kick event to Redis
      const kickEvent: ChatEventDto = {
        type: MessageType.USER_KICKED,
        matchId,
        userId,
        username: username || `user_${userId}`,
        adminId,
        reason: reason || 'No reason provided',
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(kickEvent),
      );

      this.logger.log(
        `User ${userId} kicked from match ${matchId} by admin ${adminId} for ${kickDuration} minutes`,
      );

      return {
        success: true,
        message: `User kicked successfully for ${kickDuration} minutes`,
        kickData,
      };
    } catch (error) {
      this.logger.error(`Error kicking user: ${error.message}`);
      throw error;
    }
  }

  async getBannedUsers(matchId: string): Promise<any[]> {
    try {
      const pattern = `chat_ban:${matchId}:*`;
      const keys = (await this.redis?.keys(pattern)) || [];

      const bannedUsers: any[] = [];
      for (const key of keys) {
        const banData = await this.redis?.get(key);
        if (banData) {
          const parsed = JSON.parse(banData);
          // Check if ban is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            // Extract userId from key (format: chat_ban:matchId:userId)
            const userId = key.split(':')[2];
            bannedUsers.push({
              userId,
              username: parsed.username || `user_${userId}`,
              reason: parsed.reason || 'No reason provided',
              bannedBy: parsed.adminId || '',
              timestamp: parsed.bannedAt || new Date().toISOString(),
              expiresAt: parsed.expiresAt,
            });
          } else {
            // Remove expired ban
            await this.redis?.del(key);
          }
        }
      }

      return bannedUsers;
    } catch (error) {
      this.logger.error(`Error getting banned users: ${error.message}`);
      throw error;
    }
  }

  async getKickInfo(userId: string, matchId: string): Promise<any> {
    try {
      const kickKey = `chat_kick:${matchId}:${userId}`;
      const kickData = await this.redis?.get(kickKey);

      if (!kickData) {
        return null;
      }

      const parsed = JSON.parse(kickData);

      // Check if kick is still active
      if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
        return {
          kicked: true,
          reason: parsed.reason || 'No reason provided',
          adminId: parsed.adminId,
          timestamp: parsed.timestamp,
          expiresAt: parsed.expiresAt,
        };
      } else {
        // Remove expired kick
        await this.redis?.del(kickKey);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error getting kick info: ${error.message}`);
      return null;
    }
  }

  async getMutedUsers(matchId: string): Promise<any[]> {
    try {
      const pattern = `chat_mute:${matchId}:*`;
      const keys = (await this.redis?.keys(pattern)) || [];

      const mutedUsers: any[] = [];
      for (const key of keys) {
        const muteData = await this.redis?.get(key);
        if (muteData) {
          const parsed = JSON.parse(muteData);
          // Check if mute is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            // Extract userId from key (format: chat_mute:matchId:userId)
            const userId = key.split(':')[2];
            mutedUsers.push({
              userId,
              username: parsed.username || `user_${userId}`,
              reason: parsed.reason || 'No reason provided',
              mutedBy: parsed.adminId || '',
              timestamp: parsed.mutedAt || new Date().toISOString(),
              expiresAt: parsed.expiresAt,
            });
          } else {
            // Remove expired mute
            await this.redis?.del(key);
          }
        }
      }

      return mutedUsers;
    } catch (error) {
      this.logger.error(`Error getting muted users: ${error.message}`);
      throw error;
    }
  }

  async getKickedUsers(matchId: string): Promise<any[]> {
    try {
      const pattern = `chat_kick:${matchId}:*`;
      const keys = (await this.redis?.keys(pattern)) || [];

      const kickedUsers: any[] = [];
      for (const key of keys) {
        const kickData = await this.redis?.get(key);
        if (kickData) {
          const parsed = JSON.parse(kickData);
          // Check if kick is still active
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            // Extract userId from key (format: chat_kick:matchId:userId)
            const userId = key.split(':')[2];
            kickedUsers.push({
              userId,
              username: parsed.username || `user_${userId}`,
              reason: parsed.reason || 'No reason provided',
              adminId: parsed.adminId || '',
              timestamp: parsed.timestamp || new Date().toISOString(),
              duration: parsed.duration || 15,
              expiresAt: parsed.expiresAt,
            });
          } else {
            // Remove expired kick
            await this.redis?.del(key);
          }
        }
      }

      return kickedUsers;
    } catch (error) {
      this.logger.error(`Error getting kicked users: ${error.message}`);
      throw error;
    }
  }

  async unkickUser(
    unkickUserDto: UnkickUserDto,
    adminId: string,
  ): Promise<any> {
    try {
      const { userId, matchId } = unkickUserDto;

      // Validate userId
      if (!userId || userId.trim() === '') {
        throw new Error('userId should not be empty, userId must be a string');
      }

      // Remove kick status from Redis
      const kickKey = `chat_kick:${matchId}:${userId}`;
      await this.redis?.del(kickKey);

      // Publish unkick event to Redis
      const unkickEvent: ChatEventDto = {
        type: MessageType.USER_UNKICKED,
        matchId,
        userId,
        username: `user_${userId}`,
        adminId,
        timestamp: new Date().toISOString(),
      };

      await this.redis?.publish(
        `chat_events:${matchId}`,
        JSON.stringify(unkickEvent),
      );

      this.logger.log(
        `User ${userId} unkicked from match ${matchId} by admin ${adminId}`,
      );

      return {
        success: true,
        message: 'User unkicked successfully',
      };
    } catch (error) {
      this.logger.error(`Error unkicking user: ${error.message}`);
      throw error;
    }
  }

  // Check if user is banned
  async isUserBanned(userId: string, matchId: string): Promise<boolean> {
    try {
      const banKey = `chat_ban:${matchId}:${userId}`;
      const banData = await this.redis?.get(banKey);

      if (!banData) return false;

      const parsed = JSON.parse(banData);
      // Check if ban is still active
      if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date()) {
        // Remove expired ban
        await this.redis?.del(banKey);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking if user is banned: ${error.message}`);
      return false;
    }
  }

  // Get ban info for user
  async getBanInfo(userId: string, matchId: string): Promise<any> {
    try {
      const banKey = `chat_ban:${matchId}:${userId}`;
      const banData = await this.redis?.get(banKey);

      if (!banData) return null;

      const parsed = JSON.parse(banData);
      // Check if ban is still active
      if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date()) {
        // Remove expired ban
        await this.redis?.del(banKey);
        return null;
      }

      return parsed;
    } catch (error) {
      this.logger.error(`Error getting ban info: ${error.message}`);
      return null;
    }
  }

  // Check if user is muted
  async isUserMuted(userId: string, matchId: string): Promise<boolean> {
    try {
      const muteKey = `chat_mute:${matchId}:${userId}`;
      const muteData = await this.redis?.get(muteKey);

      if (!muteData) return false;

      const parsed = JSON.parse(muteData);
      // Check if mute is still active
      if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date()) {
        // Remove expired mute
        await this.redis?.del(muteKey);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking if user is muted: ${error.message}`);
      return false;
    }
  }

  // Get user status (mute/ban/kick info)
  async getUserStatus(
    userId: string,
    matchId: string,
    displayName?: string,
  ): Promise<{
    isMuted: boolean;
    isBanned: boolean;
    isKicked: boolean;
    muteInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
    };
    banInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
    };
    kickInfo: {
      reason: string;
      expiresAt: string | null;
      remainingTime: number;
      adminId: string;
      timestamp: string;
    };
  }> {
    try {
      // For anonymous users, we need to check both userId and displayName combinations
      let muteKey = `chat_mute:${matchId}:${userId}`;
      let banKey = `chat_ban:${matchId}:${userId}`;
      let kickKey = `chat_kick:${matchId}:${userId}`;

      // If it's an anonymous user with display name, also check by display name
      if (userId === 'anonymous' && displayName) {
        const anonymousKey = `anonymous:${displayName}`;
        muteKey = `chat_mute:${matchId}:${anonymousKey}`;
        banKey = `chat_ban:${matchId}:${anonymousKey}`;
        kickKey = `chat_kick:${matchId}:${anonymousKey}`;
      }

      // Check mute status
      let muteInfo = {
        reason: '',
        expiresAt: null as string | null,
        remainingTime: 0,
      };
      let isMuted = false;

      const muteData = await this.redis?.get(muteKey);
      if (muteData) {
        const parsed = JSON.parse(muteData);
        if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
          isMuted = true;
          muteInfo = {
            reason: parsed.reason || 'No reason provided',
            expiresAt: parsed.expiresAt,
            remainingTime: parsed.expiresAt
              ? Math.ceil(
                  (new Date(parsed.expiresAt).getTime() - Date.now()) / 1000,
                )
              : 0,
          };
        } else {
          // Remove expired mute
          await this.redis?.del(muteKey);
        }
      }

      // Check ban status
      let banInfo = {
        reason: '',
        expiresAt: null as string | null,
        remainingTime: 0,
      };
      let isBanned = false;

      const banData = await this.redis?.get(banKey);
      if (banData) {
        const parsed = JSON.parse(banData);
        if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
          isBanned = true;
          banInfo = {
            reason: parsed.reason || 'No reason provided',
            expiresAt: parsed.expiresAt,
            remainingTime: parsed.expiresAt
              ? Math.ceil(
                  (new Date(parsed.expiresAt).getTime() - Date.now()) / 1000,
                )
              : 0,
          };
        } else {
          // Remove expired ban
          await this.redis?.del(banKey);
        }
      }

      // Check kick status
      let kickInfo = {
        reason: '',
        expiresAt: null as string | null,
        remainingTime: 0,
        adminId: '',
        timestamp: '',
      };
      let isKicked = false;

      const kickData = await this.redis?.get(kickKey);
      if (kickData) {
        const parsed = JSON.parse(kickData);
        if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
          isKicked = true;
          kickInfo = {
            reason: parsed.reason || 'No reason provided',
            expiresAt: parsed.expiresAt,
            remainingTime: parsed.expiresAt
              ? Math.ceil(
                  (new Date(parsed.expiresAt).getTime() - Date.now()) / 1000,
                )
              : 0,
            adminId: parsed.adminId || '',
            timestamp: parsed.timestamp || '',
          };
        } else {
          // Remove expired kick
          await this.redis?.del(kickKey);
        }
      }

      return {
        isMuted,
        isBanned,
        isKicked,
        muteInfo,
        banInfo,
        kickInfo,
      };
    } catch (error) {
      this.logger.error(`Error getting user status: ${error.message}`);
      return {
        isMuted: false,
        isBanned: false,
        isKicked: false,
        muteInfo: { reason: '', expiresAt: null, remainingTime: 0 },
        banInfo: { reason: '', expiresAt: null, remainingTime: 0 },
        kickInfo: {
          reason: '',
          expiresAt: null,
          remainingTime: 0,
          adminId: '',
          timestamp: '',
        },
      };
    }
  }
}
