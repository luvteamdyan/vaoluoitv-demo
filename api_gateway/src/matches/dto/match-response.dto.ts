import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeamDto, LeagueDto } from './create-match.dto';

export class StreamKeyInfoDto {
  @ApiProperty({
    description: 'ID của stream key',
    example: '68dbc427e64aa9e749156f6c',
    type: 'string',
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Danh sách matches được gán cho stream key này',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  matches: Array<{
    _id: string;
    home_team: any;
    away_team: any;
    match_time: string;
    match_date: string;
    status: string;
    status_code: string;
  }>;

  @ApiProperty({
    description: 'Thông tin user sở hữu stream key',
    nullable: true,
  })
  @Expose()
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    display_name?: string;
  } | null;

  @ApiProperty({
    description: 'Thời gian tạo stream key',
    example: '2025-09-30T11:51:03.415Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiProperty({
    description: 'Thời gian thu hồi stream key',
    example: null,
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  revoked_at: Date | null;

  @ApiProperty({
    description: 'Mô tả stream key',
    example: '',
    type: 'string',
  })
  @Expose()
  description: string;
}

export class MatchResponseDto {
  @ApiProperty({
    description: 'ID của trận đấu',
    example: '68d25d043b9bdb726fe4fad2',
    type: 'string',
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Thông tin đội nhà',
    type: TeamDto,
  })
  @Expose()
  @Type(() => TeamDto)
  home_team: TeamDto;

  @ApiProperty({
    description: 'Thông tin đội khách',
    type: TeamDto,
  })
  @Expose()
  @Type(() => TeamDto)
  away_team: TeamDto;

  @ApiProperty({
    description: 'Thông tin giải đấu',
    type: LeagueDto,
  })
  @Expose()
  @Type(() => LeagueDto)
  league: LeagueDto;

  @ApiProperty({
    description: 'Giờ thi đấu',
    example: '16:00',
    type: 'string',
  })
  @Expose()
  match_time: string;

  @ApiProperty({
    description: 'Ngày thi đấu',
    example: '11/10/2025',
    type: 'string',
  })
  @Expose()
  match_date: string;

  @ApiProperty({
    description: 'Trạng thái trận đấu',
    example: 'not_started',
    type: 'string',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Mã trạng thái từ API',
    example: 'NS',
    type: 'string',
  })
  @Expose()
  status_code: string;

  @ApiProperty({
    description: 'Loại trận đấu',
    example: 'league',
    type: 'string',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Tỷ số đội nhà',
    example: 0,
    type: 'number',
  })
  @Expose()
  home_score: number;

  @ApiProperty({
    description: 'Tỷ số đội khách',
    example: 0,
    type: 'number',
  })
  @Expose()
  away_score: number;

  @ApiProperty({
    description: 'Sân vận động',
    example: 'Old Trafford',
    type: 'string',
  })
  @Expose()
  venue: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    type: 'boolean',
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'Trận đấu nổi bật',
    example: false,
    type: 'boolean',
  })
  @Expose()
  is_featured: boolean;

  @ApiProperty({
    description: 'Mô tả trận đấu',
    example: 'Trận đấu quan trọng trong khuôn khổ Premier League',
    type: 'string',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Các thẻ tag',
    example: ['premier-league', 'derby', 'important'],
    type: 'array',
    items: { type: 'string' },
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'Thông tin stream key được gán cho trận đấu',
    type: StreamKeyInfoDto,
    nullable: true,
  })
  @Expose()
  @Type(() => StreamKeyInfoDto)
  stream_key?: StreamKeyInfoDto;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2025-09-23T08:40:36.422Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2025-09-23T08:40:36.422Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  // Ẩn các field không cần thiết khỏi response
  @Exclude()
  stream_key_id: any;

  @Exclude()
  _id: any;

  @Exclude()
  __v: any;

  constructor(partial: any) {
    // Handle both Mongoose documents and plain objects
    const data = partial._doc || partial;

    // Gán các field cần thiết, loại bỏ các field không cần thiết
    this.id = data._id?.toString() || data.id;
    this.home_team = data.home_team;
    this.away_team = data.away_team;
    this.league = data.league;
    this.match_time = data.match_time;
    this.match_date = data.match_date;
    this.status = data.status;
    this.status_code = data.status_code;
    this.type = data.type;
    this.home_score = data.home_score;
    this.away_score = data.away_score;
    this.venue = data.venue;
    this.is_active = data.is_active;
    this.is_featured = data.is_featured;
    this.description = data.description;
    this.tags = data.tags;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Handle populated stream_key_id
    if (data.stream_key_id && typeof data.stream_key_id === 'object') {
      const streamKey = data.stream_key_id;
      this.stream_key = {
        id: streamKey._id?.toString() || streamKey.id,
        matches: streamKey.matches || [],
        user:
          streamKey.user_id && typeof streamKey.user_id === 'object'
            ? {
                _id: streamKey.user_id._id?.toString() || streamKey.user_id.id,
                username: streamKey.user_id.username,
                email: streamKey.user_id.email,
                role: streamKey.user_id.role,
                display_name: streamKey.user_id.display_name,
              }
            : null,
        created_at: streamKey.created_at,
        revoked_at: streamKey.revoked_at,
        description: streamKey.description || '',
      };
    }
  }
}

export class MatchListResponseDto {
  @ApiProperty({
    description: 'Danh sách trận đấu',
    type: [MatchResponseDto],
  })
  @Expose()
  @Type(() => MatchResponseDto)
  matches: MatchResponseDto[];

  @ApiProperty({
    description: 'Tổng số trận đấu',
    example: 134,
    type: 'number',
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
    type: 'number',
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Số lượng trận đấu mỗi trang',
    example: 27,
    type: 'number',
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 5,
    type: 'number',
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo',
    example: true,
    type: 'boolean',
  })
  @Expose()
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước',
    example: false,
    type: 'boolean',
  })
  @Expose()
  hasPrev: boolean;

  constructor(matches: any[], total: number, page: number, limit: number) {
    this.matches = matches.map((match) => new MatchResponseDto(match));
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}
