import { ApiProperty } from '@nestjs/swagger';
import { UploadType } from '@/schemas/upload.schema';
import { ResponsiveVariantDto } from './responsive.dto';

export class UploadResponseDto {
  @ApiProperty({
    description: 'ID của upload',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  upload_id: string;

  @ApiProperty({
    description: 'ID người dùng',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  user_id: string;

  @ApiProperty({
    description: 'Tên file đã lưu',
    example: 'product_image_123.jpg',
    type: 'string',
  })
  file_name: string;

  @ApiProperty({
    description: 'Tên file gốc',
    example: 'my_product_image.jpg',
    type: 'string',
  })
  original_name: string;

  @ApiProperty({
    description: 'Loại MIME',
    example: 'image/jpeg',
    type: 'string',
  })
  mime_type: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000,
    type: 'number',
  })
  file_size: number;

  @ApiProperty({
    description: 'Loại file',
    enum: UploadType,
    example: UploadType.IMAGE,
  })
  file_type: UploadType;

  @ApiProperty({
    description: 'URL file đã upload',
    example: 'https://cdn.example.com/files/product_image_123.jpg',
    type: 'string',
    required: false,
  })
  url?: string;

  @ApiProperty({
    description: 'Các variants responsive',
    type: [ResponsiveVariantDto],
    required: false,
  })
  responsive_variants?: ResponsiveVariantDto[];

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

export class UploadListResponseDto {
  @ApiProperty({
    description: 'Danh sách uploads',
    type: [UploadResponseDto],
  })
  uploads: UploadResponseDto[];

  @ApiProperty({
    description: 'Tổng số uploads',
    example: 150,
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
    example: 15,
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
