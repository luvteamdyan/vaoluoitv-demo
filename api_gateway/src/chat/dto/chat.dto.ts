import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  display_name?: string;
}

export class GetMessagesDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsOptional()
  @IsDateString()
  before?: string;

  @IsOptional()
  limit?: number = 50;
}

export class ModerateMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsBoolean()
  isModerated: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class DeleteMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  duration?: number; // Duration in minutes, 0 = permanent

  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class MuteUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  duration?: number; // Duration in minutes, 0 = permanent

  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class KickUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  duration?: number; // Duration in minutes, default 15 minutes

  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class UnbanUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;
}

export class UnkickUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;
}

export class UnmuteUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsOptional()
  username?: string;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;
}

export enum MessageType {
  MESSAGE = 'message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  MESSAGE_DELETED = 'message_deleted',
  MESSAGE_MODERATED = 'message_moderated',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  USER_MUTED = 'user_muted',
  USER_UNMUTED = 'user_unmuted',
  USER_KICKED = 'user_kicked',
  USER_UNKICKED = 'user_unkicked',
}

export class ChatEventDto {
  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  display_name?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  messageId?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  userType?: 'user' | 'moderator' | 'admin';

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  adminId?: string;

  @IsDateString()
  timestamp: string;
}
