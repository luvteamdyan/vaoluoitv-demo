import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MatchesService } from '@/matches/matches.service';
import { CreateMatchDto } from '@/matches/dto/create-match.dto';
import { UpdateMatchDto } from '@/matches/dto/update-match.dto';
import { MatchQueryDto } from '@/matches/dto/match-query.dto';
import {
  DeleteMatchesFilterDto,
  DeleteMatchesResponseDto,
} from '@/matches/dto/delete-matches-filter.dto';
import {
  MatchResponseDto,
  MatchListResponseDto,
} from '@/matches/dto/match-response.dto';
import { SecureApiService } from '@/middleware/serure-middleware/secure-api.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/schemas/user.schema';
import { MatchStatus } from '@/schemas/match.schema';

@ApiTags('Matches')
@Controller('api/v1/matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly secureApiService: SecureApiService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Tạo trận đấu mới (Admin)',
    description: 'Tạo trận đấu mới trong hệ thống',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateMatchDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo trận đấu thành công',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async create(
    @Body() createMatchDto: CreateMatchDto,
  ): Promise<MatchResponseDto> {
    const match = await this.matchesService.create(createMatchDto);
    return new MatchResponseDto(match);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách trận đấu (Public)',
    description: 'Lấy danh sách trận đấu với paging và filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Số trang',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng mỗi trang',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Trạng thái trận đấu',
    enum: MatchStatus,
  })
  @ApiQuery({
    name: 'league_id',
    required: false,
    description: 'ID giải đấu',
    example: 'league_123',
  })
  @ApiQuery({
    name: 'team_id',
    required: false,
    description: 'ID đội bóng',
    example: 'team_123',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Ngày thi đấu (format: DD/MM/YYYY)',
    example: '11/10/2025',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Tìm kiếm theo tên đội, giải đấu, huấn luyện viên, sân vận động',
    example: 'Manchester',
  })
  @ApiQuery({
    name: 'featured',
    required: false,
    description: 'Lọc trận đấu nổi bật (true/false)',
    example: 'true',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Loại trận đấu',
    enum: ['league', 'cup', 'friendly', 'championship', 'international'],
    example: 'league',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Trạng thái hoạt động (true/false)',
    example: 'true',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sắp xếp theo thời gian trận đấu (asc/desc)',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Field để sắp xếp (match_date, status, league.name, etc.)',
    example: 'match_date',
  })
  @ApiQuery({
    name: 'has_commentator',
    required: false,
    description: 'Filter matches có bình luận viên (true/false)',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách trận đấu',
    type: MatchListResponseDto,
  })
  async findAll(@Query() query: MatchQueryDto): Promise<MatchListResponseDto> {
    const {
      page = 1,
      limit = 10,
      status,
      league_id,
      team_id,
      search,
      date,
      featured,
      type,
      is_active,
      sort,
      sort_by,
      has_commentator,
    } = query;

    const result = await this.matchesService.findAll(
      page,
      limit,
      status,
      league_id,
      team_id,
      search,
      date,
      featured,
      type,
      is_active,
      sort,
      sort_by,
      has_commentator,
    );
    return new MatchListResponseDto(
      result.matches,
      result.total,
      result.page,
      result.totalPages,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin trận đấu (Public)',
    description: 'Lấy thông tin chi tiết của một trận đấu theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin trận đấu',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy trận đấu',
  })
  async findOne(@Param('id') id: string): Promise<MatchResponseDto> {
    const match = await this.matchesService.findOne(id);
    return new MatchResponseDto(match);
  }

  @Get('stream-key/:streamKeyId')
  @ApiOperation({
    summary: 'Lấy danh sách trận đấu theo stream key ID',
    description: 'Lấy tất cả trận đấu được gán cho một stream key cụ thể',
  })
  @ApiParam({ name: 'streamKeyId', description: 'ID của stream key' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách trận đấu',
    type: MatchListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key',
  })
  async findByStreamKey(
    @Param('streamKeyId') streamKeyId: string,
  ): Promise<MatchListResponseDto> {
    const result = await this.matchesService.findByStreamKey(streamKeyId);
    return new MatchListResponseDto(
      result.matches,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':id/stream')
  @ApiOperation({
    summary: 'Lấy URL stream (Public)',
    description: 'Lấy URL stream đã được ký cho trận đấu đang diễn ra',
  })
  @ApiParam({ name: 'id', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'URL stream',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://stream.example.com/match_123.flv?token=...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy trận đấu hoặc trận đấu không đang diễn ra',
  })
  async getStreamUrl(@Param('id') id: string): Promise<{ url: string }> {
    try {
      const match = await this.matchesService.findOne(id);

      if (!match || match.status !== MatchStatus.LIVE) {
        throw new HttpException(
          'Match not found or not live',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if match has active stream key using StreamKeysService
      const activeStreamKey =
        await this.matchesService.findActiveStreamKeyForMatch(id);
      if (!activeStreamKey) {
        throw new HttpException(
          'No live available for this match',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate signed URL for stream access
      const signedUrls = await this.secureApiService.generateMultipleUrls(id, {
        formats: ['flv'],
        ttl: 3600, // 1 hour
      });

      return { url: signedUrls.flv.url };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to sign URL: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Cập nhật trận đấu (Admin và Caster)',
    description: 'Cập nhật thông tin trận đấu',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID của trận đấu' })
  @ApiBody({ type: UpdateMatchDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trận đấu thành công',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy trận đấu',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchResponseDto> {
    const match = await this.matchesService.update(id, updateMatchDto);
    return new MatchResponseDto(match);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Xóa hàng loạt trận đấu theo filter (Admin)',
    description:
      'Hard delete nhiều trận đấu cùng lúc theo các điều kiện filter',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: DeleteMatchesFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Xóa trận đấu thành công',
    type: DeleteMatchesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thiếu confirmation',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async deleteHardMatchesByFilter(
    @Body() filter: DeleteMatchesFilterDto,
  ): Promise<DeleteMatchesResponseDto> {
    return await this.matchesService.deleteHardMatchesByFilter(filter);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Xóa trận đấu (Admin)',
    description:
      'Xóa trận đấu khỏi hệ thống (stream keys liên quan sẽ không bị xóa)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID của trận đấu' })
  @ApiResponse({
    status: 200,
    description: 'Xóa trận đấu thành công',
    schema: {
      type: 'object',
      properties: {
        deletedMatch: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Successfully deleted match' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy trận đấu',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async remove(@Param('id') id: string): Promise<{
    deletedMatch: boolean;
    message: string;
  }> {
    return await this.matchesService.remove(id);
  }
}
