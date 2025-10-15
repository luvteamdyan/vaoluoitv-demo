import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import {
  SendMessageDto,
  GetMessagesDto,
  ModerateMessageDto,
  DeleteMessageDto,
  BanUserDto,
  MuteUserDto,
  KickUserDto,
  UnbanUserDto,
  UnmuteUserDto,
  UnkickUserDto,
} from './dto/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi tin nhắn',
    description:
      'Gửi tin nhắn trong chat của trận đấu (hỗ trợ cả user đã đăng nhập và anonymous user)',
  })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Gửi tin nhắn thành công',
  })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    const userRole = req.user?.role || 'user';
    return await this.chatService.sendMessage(sendMessageDto, userId, userRole);
  }

  @Get('messages/:matchId')
  @ApiOperation({
    summary: 'Lấy tin nhắn',
    description:
      'Lấy danh sách tin nhắn của trận đấu (không yêu cầu đăng nhập)',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiQuery({
    name: 'before',
    required: false,
    description: 'Lấy tin nhắn trước timestamp này',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng tin nhắn tối đa',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tin nhắn',
  })
  async getMessages(
    @Param('matchId') matchId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: number,
  ) {
    const getMessagesDto: GetMessagesDto = {
      matchId,
      before,
      limit: limit ? parseInt(limit.toString()) : 50,
    };
    return await this.chatService.getMessages(getMessagesDto);
  }

  @Put('messages/:messageId/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Kiểm duyệt tin nhắn',
    description: 'Kiểm duyệt hoặc xóa tin nhắn (dành cho admin và caster)',
  })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['approve', 'reject', 'delete'],
          example: 'approve',
        },
        reason: { type: 'string', example: 'Spam content' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kiểm duyệt tin nhắn thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền kiểm duyệt',
  })
  async moderateMessage(
    @Param('messageId') messageId: string,
    @Body() moderateMessageDto: Omit<ModerateMessageDto, 'messageId'>,
    @Request() req,
  ) {
    const moderatorId = req.user?.userId || req.user?.id;
    const fullDto: ModerateMessageDto = {
      ...moderateMessageDto,
      messageId,
    };
    return await this.chatService.moderateMessage(fullDto, moderatorId);
  }

  @Delete('messages/:messageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Xóa tin nhắn',
    description: 'Xóa tin nhắn (dành cho admin và caster)',
  })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'User request' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa tin nhắn thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa tin nhắn này',
  })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body() deleteMessageDto: Omit<DeleteMessageDto, 'messageId'>,
    @Request() req,
  ) {
    const deletedBy = req.user?.userId || req.user?.id;
    const fullDto: DeleteMessageDto = {
      ...deleteMessageDto,
      messageId,
    };
    return await this.chatService.deleteMessage(fullDto, deletedBy);
  }

  @Get('users/:matchId/active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách người dùng đang hoạt động',
    description: 'Lấy danh sách người dùng đang chat trong trận đấu',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng đang hoạt động',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async getActiveUsers(@Param('matchId') matchId: string) {
    return await this.chatService.getActiveUsers(matchId);
  }

  @Get('users/:userId/messages/:matchId/count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Đếm số tin nhắn của người dùng',
    description: 'Đếm số tin nhắn mà một người dùng đã gửi trong trận đấu',
  })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng tin nhắn',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        matchId: { type: 'string', example: '507f1f77bcf86cd799439012' },
        messageCount: { type: 'number', example: 25 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async getUserMessageCount(
    @Param('userId') userId: string,
    @Param('matchId') matchId: string,
  ) {
    const count = await this.chatService.getUserMessageCount(userId, matchId);
    return { userId, matchId, messageCount: count };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check chat service',
    description: 'Kiểm tra trạng thái hoạt động của chat service',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat service đang hoạt động bình thường',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        service: { type: 'string', example: 'chat-service' },
      },
    },
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'chat-service',
    };
  }

  // Admin User Management Endpoints
  @Post('admin/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Ban người dùng',
    description: 'Ban người dùng khỏi chat (dành cho admin)',
  })
  @ApiBody({ type: BanUserDto })
  @ApiResponse({
    status: 200,
    description: 'Ban người dùng thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền ban người dùng',
  })
  async banUser(@Body() banUserDto: BanUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.banUser(banUserDto, adminId);
  }

  @Post('admin/unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Unban người dùng',
    description: 'Gỡ ban cho người dùng (dành cho admin)',
  })
  @ApiBody({ type: UnbanUserDto })
  @ApiResponse({
    status: 200,
    description: 'Unban người dùng thành công',
  })
  async unbanUser(@Body() unbanUserDto: UnbanUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.unbanUser(unbanUserDto, adminId);
  }

  @Post('admin/mute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Mute người dùng',
    description: 'Mute người dùng trong chat (dành cho admin và caster)',
  })
  @ApiBody({ type: MuteUserDto })
  @ApiResponse({
    status: 200,
    description: 'Mute người dùng thành công',
  })
  async muteUser(@Body() muteUserDto: MuteUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.muteUser(muteUserDto, adminId);
  }

  @Post('admin/unmute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Unmute người dùng',
    description: 'Gỡ mute cho người dùng (dành cho admin và caster)',
  })
  @ApiBody({ type: UnmuteUserDto })
  @ApiResponse({
    status: 200,
    description: 'Unmute người dùng thành công',
  })
  async unmuteUser(@Body() unmuteUserDto: UnmuteUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.unmuteUser(unmuteUserDto, adminId);
  }

  @Post('admin/kick')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Kick người dùng',
    description:
      'Kick người dùng khỏi chat tạm thời (dành cho admin và caster). Kick là hình phạt nhẹ hơn ban, thường dùng để xử lý spam hoặc hành vi tạm thời không phù hợp.',
  })
  @ApiBody({ type: KickUserDto })
  @ApiResponse({
    status: 200,
    description: 'Kick người dùng thành công',
  })
  async kickUser(@Body() kickUserDto: KickUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.kickUser(kickUserDto, adminId);
  }

  @Post('admin/unkick')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Unkick người dùng',
    description: 'Gỡ bỏ kick status cho người dùng (dành cho admin và caster)',
  })
  @ApiBody({ type: UnkickUserDto })
  @ApiResponse({
    status: 200,
    description: 'Unkick người dùng thành công',
  })
  async unkickUser(@Body() unkickUserDto: UnkickUserDto, @Request() req) {
    const adminId = req.user?.userId || req.user?.id;
    return await this.chatService.unkickUser(unkickUserDto, adminId);
  }

  @Get('admin/banned-users/:matchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách người dùng bị ban',
    description:
      'Lấy danh sách người dùng bị ban trong trận đấu (dành cho admin)',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng bị ban thành công',
  })
  async getBannedUsers(@Param('matchId') matchId: string) {
    return await this.chatService.getBannedUsers(matchId);
  }

  @Get('admin/muted-users/:matchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Lấy danh sách người dùng bị mute',
    description:
      'Lấy danh sách người dùng bị mute trong trận đấu (dành cho admin và caster)',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng bị mute thành công',
  })
  async getMutedUsers(@Param('matchId') matchId: string) {
    return await this.chatService.getMutedUsers(matchId);
  }

  @Get('admin/kicked-users/:matchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER)
  @ApiOperation({
    summary: 'Lấy danh sách người dùng bị kick',
    description:
      'Lấy danh sách người dùng bị kick trong trận đấu (dành cho admin và caster)',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng bị kick thành công',
  })
  async getKickedUsers(@Param('matchId') matchId: string) {
    return await this.chatService.getKickedUsers(matchId);
  }

  @Get('user-status/:matchId')
  @ApiOperation({
    summary: 'Lấy trạng thái người dùng',
    description:
      'Lấy trạng thái mute/ban/kick của người dùng hiện tại (hỗ trợ cả user đã đăng nhập và anonymous user)',
  })
  @ApiParam({ name: 'matchId', description: 'ID của trận đấu' })
  @ApiQuery({
    name: 'displayName',
    required: false,
    description: 'Tên hiển thị cho anonymous user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy trạng thái người dùng thành công',
    schema: {
      type: 'object',
      properties: {
        isMuted: { type: 'boolean', example: false },
        isBanned: { type: 'boolean', example: false },
        isKicked: { type: 'boolean', example: false },
        muteInfo: {
          type: 'object',
          properties: {
            reason: { type: 'string', example: 'Spam messages' },
            expiresAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' },
            remainingTime: { type: 'number', example: 300 },
          },
        },
        banInfo: {
          type: 'object',
          properties: {
            reason: { type: 'string', example: 'Inappropriate behavior' },
            expiresAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' },
            remainingTime: { type: 'number', example: 3600 },
          },
        },
        kickInfo: {
          type: 'object',
          properties: {
            reason: { type: 'string', example: 'Inappropriate behavior' },
            expiresAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' },
            remainingTime: { type: 'number', example: 3600 },
            adminId: { type: 'string', example: 'admin123' },
            timestamp: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
          },
        },
      },
    },
  })
  async getUserStatus(
    @Param('matchId') matchId: string,
    @Query('displayName') displayName: string,
    @Request() req,
  ) {
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    return await this.chatService.getUserStatus(userId, matchId, displayName);
  }
}
