import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CheckInResponseDto {
  @IsString()
  message: string;

  @IsOptional()
  data?: {
    checkin: CheckInRecordDto;
    isNewRecord: boolean;
    streakUpdated: boolean;
    rewards?: {
      luckPoints: number;
      spinChances: number;
    };
  };

  @IsOptional()
  @IsString()
  error?: string;

  success: boolean;
}

export class CheckInRecordDto {
  @IsString()
  user_id: string;

  @IsString()
  username: string;

  @IsNumber()
  currentStreak: number;

  @IsDateString()
  lastCheckinAt: string;

  @IsNumber()
  lastRewardedStreak: number;

  @IsNumber()
  totalCheckins: number;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

export class CheckInStatsDto {
  @IsNumber()
  currentStreak: number;

  @IsNumber()
  totalCheckins: number;

  @IsOptional()
  @IsDateString()
  lastCheckinAt: string | null;

  @IsOptional()
  canCheckInToday: boolean;

  @IsNumber()
  nextRewardIn: number;
}

export class CheckInStatsResponseDto {
  @IsString()
  message: string;

  @IsOptional()
  data?: CheckInStatsDto;

  @IsOptional()
  @IsString()
  error?: string;

  success: boolean;
}
