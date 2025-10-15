import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UrlSignRequestDto {
  @ApiProperty({
    description: 'ID của stream cần ký URL',
    example: 'match_123',
    type: 'string',
  })
  @IsString()
  streamId: string;

  @ApiProperty({
    description: 'ID của người dùng (tùy chọn)',
    example: 'user_456',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Định dạng stream (tùy chọn)',
    example: 'flv',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({
    description: 'Thời gian sống của URL (giây)',
    example: 3600,
    type: 'number',
    minimum: 60,
    maximum: 3600,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  ttl?: number;
}

export class UrlValidateRequestDto {
  @ApiProperty({
    description: 'Đường dẫn URL cần xác thực',
    example: '/live/match_123.flv',
    type: 'string',
  })
  @IsString()
  path: string;

  @ApiProperty({
    description: 'Chữ ký bí mật của URL',
    example: 'abc123def456',
    type: 'string',
  })
  @IsString()
  wsSecret: string;

  @ApiProperty({
    description: 'Thời gian ký URL (timestamp)',
    example: 1640995200,
    type: 'number',
  })
  @IsNumber()
  wsTime: number;
}

export class UrlSignResponseDto {
  @ApiProperty({
    description: 'URL đã ký',
    example: 'https://stream.example.com/live.flv?token=...',
    type: 'string',
  })
  url: string;

  @ApiProperty({
    description: 'Chữ ký bí mật',
    example: 'abc123def456',
    type: 'string',
  })
  wsSecret: string;

  @ApiProperty({
    description: 'Thời gian ký URL (timestamp)',
    example: 1640995200,
    type: 'number',
  })
  wsTime: number;

  @ApiProperty({
    description: 'Thời gian hết hạn (ISO string)',
    example: '2024-01-01T01:00:00.000Z',
    type: 'string',
  })
  expiresAt: Date;
}

export class UrlValidateResponseDto {
  valid: boolean;
  streamId?: string;
  userId?: string;
  message?: string;
}

export class StreamInfoResponseDto {
  streamId: string;
  title: string;
  status: string;
  signedUrl?: string;
  expiresAt?: Date;
}

export class MultipleUrlsRequestDto {
  @ApiProperty({
    description: 'Danh sách định dạng stream cần tạo URL',
    example: ['flv', 'hls', 'rtmp'],
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formats?: string[];

  @ApiProperty({
    description: 'Thời gian sống của URL (giây)',
    example: 3600,
    type: 'number',
    minimum: 60,
    maximum: 3600,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  ttl?: number;
}

export class CdnUrlSignRequestDto {
  @ApiProperty({
    description: 'Danh sách định dạng stream cần tạo URL',
    example: ['m3u8', 'flv'],
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formats?: string[];

  @ApiProperty({
    description: 'Thời gian sống của URL (giây)',
    example: 3600,
    type: 'number',
    minimum: 60,
    maximum: 3600,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  ttl?: number;
}

export class CdnUrlSignResponseDto {
  @ApiProperty({
    description: 'URL đã ký cho CDN',
    example:
      'https://3014759347.global.cdnfastest.com/vaoluoitv/vaoluoitv1/index.m3u8?token=xxx&time=xxx',
    type: 'string',
  })
  url: string;

  @ApiProperty({
    description: 'Token từ URL đã ký',
    example: 'abc123def456',
    type: 'string',
  })
  token: string;

  @ApiProperty({
    description: 'Thời gian hết hạn (timestamp)',
    example: 1640995200,
    type: 'number',
  })
  time: number;

  @ApiProperty({
    description: 'Thời gian hết hạn (ISO string)',
    example: '2024-01-01T01:00:00.000Z',
    type: 'string',
  })
  expiresAt: Date;
}

export class SecureApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
