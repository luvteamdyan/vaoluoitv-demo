import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus, MatchType } from '@/schemas/match.schema';
import { TeamDto, LeagueDto } from './create-match.dto';

export class UpdateMatchDto {
  @ApiProperty({
    description: 'Thông tin đội nhà',
    type: TeamDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamDto)
  @IsObject({ message: 'Home team must be an object' })
  home_team?: TeamDto;

  @ApiProperty({
    description: 'Thông tin đội khách',
    type: TeamDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamDto)
  @IsObject({ message: 'Away team must be an object' })
  away_team?: TeamDto;

  @ApiProperty({
    description: 'Thông tin giải đấu',
    type: LeagueDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LeagueDto)
  @IsObject({ message: 'League must be an object' })
  league?: LeagueDto;

  @ApiProperty({
    description: 'Giờ thi đấu',
    example: '16:00',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Match time must be a string' })
  match_time?: string;

  @ApiProperty({
    description: 'Ngày thi đấu',
    example: '11/10/2025',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Match date must be a string in DD/MM/YYYY format' })
  match_date?: string;

  @ApiProperty({
    description: 'Trạng thái trận đấu',
    enum: MatchStatus,
    example: MatchStatus.NOT_STARTED,
    required: false,
  })
  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Invalid match status' })
  status?: MatchStatus;

  @ApiProperty({
    description: 'Mã trạng thái từ API',
    example: 'NS',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Status code must be a string' })
  status_code?: string;

  @ApiProperty({
    description: 'Loại trận đấu',
    enum: MatchType,
    example: MatchType.LEAGUE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MatchType, { message: 'Invalid match type' })
  type?: MatchType;

  @ApiProperty({
    description: 'Tỷ số đội nhà',
    example: 2,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Home score must be a number' })
  home_score?: number;

  @ApiProperty({
    description: 'Tỷ số đội khách',
    example: 1,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Away score must be a number' })
  away_score?: number;

  @ApiProperty({
    description: 'Sân vận động',
    example: 'Old Trafford',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Venue must be a string' })
  venue?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @ApiProperty({
    description: 'Trận đấu nổi bật',
    example: false,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_featured must be a boolean' })
  is_featured?: boolean;

  @ApiProperty({
    description: 'Mô tả trận đấu',
    example: 'Trận đấu quan trọng trong khuôn khổ Premier League',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Các thẻ tag',
    example: ['premier-league', 'derby', 'important'],
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
