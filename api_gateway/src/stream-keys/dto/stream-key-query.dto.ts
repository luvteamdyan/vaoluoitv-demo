import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StreamKeyQueryDto {
  @ApiProperty({
    description: 'Số trang',
    example: 1,
    type: 'number',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 10,
    type: 'number',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'ID trận đấu',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  match_id?: string;

  @ApiProperty({
    description: 'ID người dùng',
    example: '68d25d043b9bdb726fe4fad3',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    description: 'Trạng thái stream key',
    example: 'active',
    enum: ['active', 'revoked'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'revoked';
}
