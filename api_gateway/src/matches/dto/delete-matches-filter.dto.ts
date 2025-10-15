import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus, MatchType } from '@/schemas/match.schema';

export class DeleteMatchesFilterDto {
  @ApiProperty({
    description: 'Trạng thái trận đấu',
    enum: MatchStatus,
    required: false,
    example: MatchStatus.FINISHED,
  })
  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Invalid match status' })
  status?: MatchStatus;

  @ApiProperty({
    description: 'Loại trận đấu',
    enum: MatchType,
    required: false,
    example: MatchType.LEAGUE,
  })
  @IsOptional()
  @IsEnum(MatchType, { message: 'Invalid match type' })
  type?: MatchType;

  @ApiProperty({
    description: 'ID giải đấu',
    example: 'league_123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'League ID must be a string' })
  league_id?: string;

  @ApiProperty({
    description: 'ID đội bóng (home hoặc away)',
    example: 'team_123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Team ID must be a string' })
  team_id?: string;

  @ApiProperty({
    description: 'Chỉ xóa các trận đấu không hoạt động',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Inactive only must be a boolean' })
  inactive_only?: boolean;

  @ApiProperty({
    description: 'Chỉ xóa các trận đấu không nổi bật',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Non-featured only must be a boolean' })
  non_featured_only?: boolean;

  @ApiProperty({
    description: 'Danh sách ID trận đấu cụ thể để xóa',
    example: ['match_1', 'match_2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Match IDs must be an array' })
  @IsString({ each: true, message: 'Each match ID must be a string' })
  match_ids?: string[];

  @ApiProperty({
    description: 'Xác nhận xóa (bắt buộc phải true)',
    example: true,
    required: true,
  })
  @IsBoolean({ message: 'Confirmation must be a boolean' })
  confirm: boolean;
}

export class DeleteMatchesResponseDto {
  @ApiProperty({
    description: 'Số lượng trận đấu đã xóa',
    example: 25,
  })
  deletedCount: number;

  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'Successfully deleted 25 matches',
  })
  message: string;

  @ApiProperty({
    description: 'Thời gian thực hiện (ms)',
    example: 1250,
  })
  duration: number;
}
