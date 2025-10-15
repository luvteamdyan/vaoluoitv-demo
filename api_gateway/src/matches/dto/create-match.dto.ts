import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchStatus, MatchType } from '@/schemas/match.schema';

export class TeamDto {
  @ApiProperty({
    description: 'ID đội bóng',
    example: 'team_123',
    type: 'string',
  })
  @IsString({ message: 'Team ID must be a string' })
  @IsNotEmpty({ message: 'Team ID is required' })
  id: string;

  @ApiProperty({
    description: 'Tên đội bóng',
    example: 'Manchester United',
    type: 'string',
  })
  @IsString({ message: 'Team name must be a string' })
  @IsNotEmpty({ message: 'Team name is required' })
  name: string;

  @ApiProperty({
    description: 'Logo đội bóng',
    example: 'https://example.com/manchester-united-logo.png',
    type: 'string',
  })
  @IsString({ message: 'Team logo must be a string' })
  @IsNotEmpty({ message: 'Team logo is required' })
  logo: string;

  @ApiProperty({
    description: 'Link đội bóng',
    example: 'https://example.com/team/manchester-united',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Team link must be a string' })
  link?: string;

  @ApiProperty({
    description: 'Huấn luyện viên',
    example: 'Erik ten Hag',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Coach must be a string' })
  coach?: string;

  @ApiProperty({
    description: 'Slug đội bóng',
    example: 'manchester-united',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;
}

export class LeagueDto {
  @ApiProperty({
    description: 'ID giải đấu',
    example: 'league_123',
    type: 'string',
  })
  @IsString({ message: 'League ID must be a string' })
  @IsNotEmpty({ message: 'League ID is required' })
  id: string;

  @ApiProperty({
    description: 'Tên giải đấu',
    example: 'Premier League',
    type: 'string',
  })
  @IsString({ message: 'League name must be a string' })
  @IsNotEmpty({ message: 'League name is required' })
  name: string;

  @ApiProperty({
    description: 'Logo giải đấu',
    example: 'https://example.com/premier-league-logo.png',
    type: 'string',
  })
  @IsString({ message: 'League logo must be a string' })
  @IsNotEmpty({ message: 'League logo is required' })
  logo: string;

  @ApiProperty({
    description: 'Màu sắc giải đấu',
    example: '#37003C',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @ApiProperty({
    description: 'Mã giải đấu',
    example: 'EPL',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  code?: string;
}

export class CreateMatchDto {
  @ApiProperty({
    description: 'Thông tin đội nhà',
    type: TeamDto,
  })
  @ValidateNested()
  @Type(() => TeamDto)
  @IsObject({ message: 'Home team must be an object' })
  home_team: TeamDto;

  @ApiProperty({
    description: 'Thông tin đội khách',
    type: TeamDto,
  })
  @ValidateNested()
  @Type(() => TeamDto)
  @IsObject({ message: 'Away team must be an object' })
  away_team: TeamDto;

  @ApiProperty({
    description: 'Thông tin giải đấu',
    type: LeagueDto,
  })
  @ValidateNested()
  @Type(() => LeagueDto)
  @IsObject({ message: 'League must be an object' })
  league: LeagueDto;

  @ApiProperty({
    description: 'Giờ thi đấu',
    example: '15:00',
    type: 'string',
  })
  @IsString({ message: 'Match time must be a string' })
  @IsNotEmpty({ message: 'Match time is required' })
  match_time: string;

  @ApiProperty({
    description: 'Ngày thi đấu',
    example: '11/10/2025',
    type: 'string',
  })
  @IsString({ message: 'Match date must be a string in DD/MM/YYYY format' })
  @IsNotEmpty({ message: 'Match date is required' })
  match_date: string;

  @ApiProperty({
    description: 'Trạng thái trận đấu',
    enum: MatchStatus,
    example: MatchStatus.SCHEDULED,
  })
  @IsEnum(MatchStatus, { message: 'Invalid match status' })
  status: MatchStatus;

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
    example: 0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Home score must be a number' })
  home_score?: number;

  @ApiProperty({
    description: 'Tỷ số đội khách',
    example: 0,
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
