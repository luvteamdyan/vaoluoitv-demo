import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStreamKeyDto {
  @ApiProperty({
    description: 'Giá trị stream key cố định',
    example: 'sk_live_abc123def456',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  key_value: string;

  @ApiProperty({
    description: 'ID của người dùng (1 user chỉ có 1 stream key)',
    example: '68d25d043b9bdb726fe4fad3',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Danh sách ID các trận đấu được gán (để lên lịch)',
    example: ['68d25d043b9bdb726fe4fad4', '68d25d043b9bdb726fe4fad5'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  matches?: string[];

  @ApiProperty({
    description: 'Mô tả cho stream key',
    example: 'Stream key cho bình luận viên chính',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStreamKeyDto {
  @ApiProperty({
    description: 'Giá trị stream key cố định',
    example: 'sk_live_abc123def456',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  key_value?: string;

  @ApiProperty({
    description: 'Mô tả cho stream key',
    example: 'Stream key đã cập nhật',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMatchesToStreamKeyDto {
  @ApiProperty({
    description: 'Danh sách ID các trận đấu cần thêm vào stream key',
    example: ['68d25d043b9bdb726fe4fad4', '68d25d043b9bdb726fe4fad5'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  match_ids: string[];
}

export class RemoveMatchesFromStreamKeyDto {
  @ApiProperty({
    description: 'Danh sách ID các trận đấu cần xóa khỏi stream key',
    example: ['68d25d043b9bdb726fe4fad4'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  match_ids: string[];
}

export class RevokeStreamKeyDto {
  @ApiProperty({
    description: 'Lý do thu hồi stream key',
    example: 'Vi phạm điều khoản sử dụng',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StopStreamDto {
  @ApiProperty({
    description: 'ID của trận đấu cần dừng stream',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  match_id: string;
}
