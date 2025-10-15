import { ApiProperty } from '@nestjs/swagger';
import { UploadType } from '@/schemas/upload.schema';
import { UploadResponseDto } from './response.dto';

export class UploadStatsDto {
  @ApiProperty({
    description: 'Tổng số uploads',
    example: 1500,
    type: 'number',
  })
  total_uploads: number;

  @ApiProperty({
    description: 'Tổng kích thước (bytes)',
    example: 1073741824,
    type: 'number',
  })
  total_size: number;

  @ApiProperty({
    description: 'Số uploads theo loại file',
    example: { image: 1000, video: 500 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  uploads_by_type: Record<UploadType, number>;

  @ApiProperty({
    description: 'Danh sách uploads gần đây',
    type: [UploadResponseDto],
  })
  recent_uploads: UploadResponseDto[];
}
