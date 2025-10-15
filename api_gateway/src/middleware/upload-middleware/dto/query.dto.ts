import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UploadType } from '@/schemas/upload.schema';

export class UploadQueryDto {
  @ApiProperty({
    description: 'Số trang',
    example: 1,
    type: 'number',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 10,
    type: 'number',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Loại file',
    enum: UploadType,
    example: UploadType.IMAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UploadType)
  file_type?: UploadType;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    example: 'product image',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
