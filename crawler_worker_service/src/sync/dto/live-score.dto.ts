import { ApiProperty } from '@nestjs/swagger';

export class LiveScoreUpdateResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;

  @ApiProperty({
    description: 'Dữ liệu thống kê cập nhật',
    type: 'object',
    properties: {
      totalMatches: { type: 'number', description: 'Tổng số trận đấu từ API' },
      updatedMatches: {
        type: 'number',
        description: 'Số trận đấu được cập nhật',
      },
      skippedMatches: { type: 'number', description: 'Số trận đấu bị bỏ qua' },
    },
  })
  data: {
    totalMatches: number;
    updatedMatches: number;
    skippedMatches: number;
  };
}
