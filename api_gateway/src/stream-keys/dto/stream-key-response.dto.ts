import { ApiProperty } from '@nestjs/swagger';
import { StreamKey } from '@/schemas/stream-key.schema';

export class StreamKeyResponseDto {
  @ApiProperty({
    description: 'ID của stream key',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'Giá trị stream key',
    example: 'sk_live_abc123def456',
    type: 'string',
  })
  key_value: string;

  @ApiProperty({
    description: 'RTMP URL cho streaming',
    example: 'rtmp://example.com/vaoluoitv/',
    type: 'string',
  })
  rtmp_url: string;

  @ApiProperty({
    description: 'Danh sách trận đấu được gán cho stream key (để lên lịch)',
    required: false,
    isArray: true,
  })
  matches?: Array<{
    _id: string;
    home_team: any;
    away_team: any;
    match_date: string;
    match_time: string;
    status: string;
    status_code?: string;
  }>;

  @ApiProperty({
    description: 'Thông tin người dùng',
  })
  user: {
    _id: string;
    username: string;
    display_name?: string;
    email: string;
    role: string;
  };

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Thời gian thu hồi',
    example: null,
    type: 'string',
    format: 'date-time',
    required: false,
  })
  revoked_at: Date | null;

  @ApiProperty({
    description: 'Mô tả cho stream key',
    example: 'Stream key cho bình luận viên chính',
    type: 'string',
    required: false,
  })
  description?: string;

  constructor(streamKey: StreamKey) {
    this.id = (streamKey as any)._id?.toString() || '';
    this.key_value = streamKey.key_value;
    this.rtmp_url =
      streamKey.rtmp_url ||
      'rtmp://entrypoint-livebong.cdnfastest.com/vaoluoitv/';

    // Handle matches array: if populated, return array of match objects
    this.matches =
      (streamKey as any).matches && Array.isArray((streamKey as any).matches)
        ? (streamKey as any).matches
            .map((match: any) =>
              typeof match === 'object' && match._id
                ? match // It's populated match object
                : undefined,
            )
            .filter((m: any) => m !== undefined)
        : [];

    // Handle user: if it's populated (object), keep it; if it's ObjectId, convert to string
    this.user =
      (streamKey as any).user_id &&
      typeof (streamKey as any).user_id === 'object' &&
      (streamKey as any).user_id !== null
        ? (streamKey as any).user_id.username
          ? (streamKey as any).user_id // It's populated user object
          : {
              _id: (streamKey as any).user_id.toString(),
              username: '',
              email: '',
              role: '',
            } // It's ObjectId, create minimal user object
        : {
            _id: (streamKey as any).user_id as string,
            username: '',
            email: '',
            role: '',
          }; // It's already a string

    this.created_at = streamKey.created_at;
    this.revoked_at = streamKey.revoked_at;
    this.description = streamKey.description;
  }
}

export class StreamKeyListResponseDto {
  @ApiProperty({
    description: 'Danh sách stream keys',
    type: [StreamKeyResponseDto],
  })
  streamKeys: StreamKeyResponseDto[];

  @ApiProperty({
    description: 'Tổng số stream keys',
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
    description: 'Tổng số trang',
    example: 3,
    type: 'number',
  })
  totalPages: number;

  constructor(
    streamKeys: StreamKey[],
    total: number,
    page: number,
    totalPages: number,
  ) {
    this.streamKeys = streamKeys.map((sk) => new StreamKeyResponseDto(sk));
    this.total = total;
    this.page = page;
    this.totalPages = totalPages;
  }
}
