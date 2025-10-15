import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AdsPosition {
  MAIN_ADS = 'main_ads',
  SUB_ADS_1 = 'sub_ads_1',
  SUB_ADS_2 = 'sub_ads_2',
  SUB_ADS_3 = 'sub_ads_3',
  HERO_MAIN = 'hero_main',
  HERO_LEFT = 'hero_left',
  HERO_RIGHT = 'hero_right',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export class CreateAdsConfigDto {
  @ApiProperty({
    description: 'Vị trí hiển thị quảng cáo',
    enum: AdsPosition,
    example: AdsPosition.MAIN_ADS,
  })
  @IsEnum(AdsPosition)
  position: AdsPosition;

  @ApiProperty({
    description: 'Tiêu đề quảng cáo',
    example: 'Quảng cáo sản phẩm mới',
    type: 'string',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mô tả quảng cáo',
    example: 'Sản phẩm chất lượng cao với giá tốt',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL media quảng cáo',
    example: 'https://example.com/ads/image.jpg',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  media_url?: string;

  @ApiProperty({
    description: 'Loại media',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  media_type: MediaType;

  @ApiProperty({
    description: 'ID file upload',
    example: 'upload_123',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  upload_id?: string;

  @ApiProperty({
    description: 'URL liên kết khi click',
    example: 'https://example.com/product',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Alt text cho hình ảnh',
    example: 'Quảng cáo sản phẩm',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiProperty({
    description: 'Đối tượng mục tiêu',
    example: 'Người dùng 18-35 tuổi',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  target_audience?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu hiển thị',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'Ngày kết thúc hiển thị',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Độ ưu tiên hiển thị (1-10)',
    example: 5,
    type: 'number',
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;

  @ApiProperty({
    description: 'Dữ liệu tùy chỉnh',
    example: { category: 'sports', region: 'vietnam' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  custom_data?: Record<string, any>;
}

export class UpdateAdsConfigDto {
  @ApiProperty({
    description: 'Vị trí hiển thị quảng cáo',
    enum: AdsPosition,
    example: AdsPosition.MAIN_ADS,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdsPosition)
  position?: AdsPosition;

  @ApiProperty({
    description: 'Tiêu đề quảng cáo',
    example: 'Quảng cáo sản phẩm mới',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Mô tả quảng cáo',
    example: 'Sản phẩm chất lượng cao với giá tốt',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL media quảng cáo',
    example: 'https://example.com/ads/image.jpg',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  media_url?: string;

  @ApiProperty({
    description: 'Loại media',
    enum: MediaType,
    example: MediaType.IMAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @ApiProperty({
    description: 'ID file upload',
    example: 'upload_123',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  upload_id?: string;

  @ApiProperty({
    description: 'URL liên kết khi click',
    example: 'https://example.com/product',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Alt text cho hình ảnh',
    example: 'Quảng cáo sản phẩm',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiProperty({
    description: 'Đối tượng mục tiêu',
    example: 'Người dùng 18-35 tuổi',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  target_audience?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu hiển thị',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'Ngày kết thúc hiển thị',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Độ ưu tiên hiển thị (1-10)',
    example: 5,
    type: 'number',
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;

  @ApiProperty({
    description: 'Dữ liệu tùy chỉnh',
    example: { category: 'sports', region: 'vietnam' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  custom_data?: Record<string, any>;
}

export class AdsConfigResponseDto {
  @ApiProperty({
    description: 'ID của cấu hình quảng cáo',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'Vị trí hiển thị quảng cáo',
    enum: AdsPosition,
    example: AdsPosition.MAIN_ADS,
  })
  position: AdsPosition;

  @ApiProperty({
    description: 'Tiêu đề quảng cáo',
    example: 'Quảng cáo sản phẩm mới',
    type: 'string',
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả quảng cáo',
    example: 'Sản phẩm chất lượng cao với giá tốt',
    type: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'URL media quảng cáo',
    example: 'https://example.com/ads/image.jpg',
    type: 'string',
    required: false,
  })
  media_url?: string;

  @ApiProperty({
    description: 'Loại media',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  media_type: MediaType;

  @ApiProperty({
    description: 'ID file upload',
    example: 'upload_123',
    type: 'string',
    required: false,
  })
  upload_id?: string;

  @ApiProperty({
    description: 'URL liên kết khi click',
    example: 'https://example.com/product',
    type: 'string',
    required: false,
  })
  link_url?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Số lần click',
    example: 150,
    type: 'number',
  })
  click_count: number;

  @ApiProperty({
    description: 'Alt text cho hình ảnh',
    example: 'Quảng cáo sản phẩm',
    type: 'string',
    required: false,
  })
  alt_text?: string;

  @ApiProperty({
    description: 'Đối tượng mục tiêu',
    example: 'Người dùng 18-35 tuổi',
    type: 'string',
    required: false,
  })
  target_audience?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu hiển thị',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  start_date?: Date;

  @ApiProperty({
    description: 'Ngày kết thúc hiển thị',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  end_date?: Date;

  @ApiProperty({
    description: 'Độ ưu tiên hiển thị',
    example: 5,
    type: 'number',
  })
  priority: number;

  @ApiProperty({
    description: 'Dữ liệu tùy chỉnh',
    example: { category: 'sports', region: 'vietnam' },
    type: 'object',
    additionalProperties: true,
  })
  custom_data?: Record<string, any>;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class AdsConfigListResponseDto {
  @ApiProperty({
    description: 'Danh sách cấu hình quảng cáo',
    type: [AdsConfigResponseDto],
  })
  configs: AdsConfigResponseDto[];

  @ApiProperty({
    description: 'Tổng số cấu hình',
    example: 25,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
    type: 'number',
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 10,
    type: 'number',
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 3,
    type: 'number',
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo',
    example: true,
    type: 'boolean',
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước',
    example: false,
    type: 'boolean',
  })
  hasPrev: boolean;
}

export class AdsConfigQueryDto {
  @ApiProperty({
    description: 'Vị trí hiển thị quảng cáo',
    enum: AdsPosition,
    example: AdsPosition.MAIN_ADS,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdsPosition)
  position?: AdsPosition;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Loại media',
    enum: MediaType,
    example: MediaType.IMAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    example: 'sản phẩm mới',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
