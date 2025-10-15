import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResponsiveDimensionDto {
  @ApiProperty({
    description: 'Tên kích thước',
    example: 'mobile',
    type: 'string',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Chiều rộng',
    example: 480,
    type: 'number',
  })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({
    description: 'Chiều cao',
    example: 640,
    type: 'number',
  })
  @IsNumber()
  @Min(1)
  height: number;

  @ApiProperty({
    description: 'Chất lượng (1-100)',
    example: 80,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;
}

export class ResponsiveVariantDto {
  @ApiProperty({
    description: 'Tên variant',
    example: 'mobile',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    description: 'Chiều rộng',
    example: 480,
    type: 'number',
  })
  width: number;

  @ApiProperty({
    description: 'Chiều cao',
    example: 640,
    type: 'number',
  })
  height: number;

  @ApiProperty({
    description: 'URL của variant',
    example: 'https://cdn.example.com/variants/image_mobile.jpg',
    type: 'string',
  })
  url: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 256000,
    type: 'number',
  })
  size: number;

  @ApiProperty({
    description: 'Chất lượng',
    example: 80,
    type: 'number',
    required: false,
  })
  quality?: number;
}
