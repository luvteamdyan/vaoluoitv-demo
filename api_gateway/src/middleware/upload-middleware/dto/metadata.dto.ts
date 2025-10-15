import {
  IsOptional,
  IsString,
  IsObject,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ResponsiveDimensionDto } from './responsive.dto';

export class UploadMetadataDto {
  @ApiProperty({
    description: 'Tiêu đề file',
    example: 'Hình ảnh sản phẩm',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Mô tả file',
    example: 'Hình ảnh sản phẩm chất lượng cao',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Danh mục file',
    example: 'products',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Danh mục con',
    example: 'electronics',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({
    description: 'Các thẻ tag',
    example: ['product', 'electronics', 'new'],
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Nếu là string phân cách bằng dấu phẩy, split thành array
      if (value.includes(',')) {
        return value
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
      // Nếu là JSON string, parse thành array
      try {
        return JSON.parse(value);
      } catch {
        return [value]; // Nếu không parse được, trả về array với 1 element
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Dữ liệu tùy chỉnh',
    example: { brand: 'Apple', model: 'iPhone 15' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  custom_data?: Record<string, any>;

  @ApiProperty({
    description: 'Kích thước responsive tùy chỉnh',
    type: [ResponsiveDimensionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsiveDimensionDto)
  responsiveDimensions?: ResponsiveDimensionDto[];

  @ApiProperty({
    description: 'Có tạo responsive variants không',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  generateResponsive?: boolean;
}
