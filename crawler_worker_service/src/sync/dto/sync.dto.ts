import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class SyncRequestDto {
  @ApiProperty({
    description: 'Ngày cần sync (format: DD-MM-YYYY)',
    example: '23-09-2025',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu sync (format: YYYY-MM-DD)',
    example: '2025-09-20',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc sync (format: YYYY-MM-DD)',
    example: '2025-09-25',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Force sync ngay cả khi đã có data',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiProperty({
    description: 'Số lần retry khi có lỗi',
    example: 3,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  retry?: number;
}

export class SyncResponseDto {
  @ApiProperty({
    description: 'Trạng thái thành công',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Sync completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Dữ liệu trả về',
    required: false,
  })
  data?: any;
}
