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
  Logger,
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
import { StreamKeysService } from '@/stream-keys/stream-keys.service';
import {
  CreateStreamKeyDto,
  UpdateStreamKeyDto,
  AddMatchesToStreamKeyDto,
  RemoveMatchesFromStreamKeyDto,
} from '@/stream-keys/dto/create-stream-key.dto';
import { StreamKeyQueryDto } from '@/stream-keys/dto/stream-key-query.dto';
import {
  StreamKeyResponseDto,
  StreamKeyListResponseDto,
} from '@/stream-keys/dto/stream-key-response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/schemas/user.schema';

@ApiTags('Stream Keys')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/stream-keys')
export class StreamKeysController {
  private readonly logger = new Logger(StreamKeysController.name);

  constructor(private readonly streamKeysService: StreamKeysService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Tạo stream key mới',
    description: 'Tạo stream key mới cho trận đấu (Admin only)',
  })
  @ApiBody({ type: CreateStreamKeyDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo stream key thành công',
    type: StreamKeyResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async create(
    @Body() createStreamKeyDto: CreateStreamKeyDto,
  ): Promise<StreamKeyResponseDto> {
    const streamKey = await this.streamKeysService.create(createStreamKeyDto);
    return new StreamKeyResponseDto(streamKey);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Lấy danh sách stream keys',
    description:
      'Lấy danh sách tất cả stream keys với paging và filtering (Admin và Caster)',
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
    name: 'match_id',
    required: false,
    description: 'ID của trận đấu',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'ID của người dùng',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Trạng thái stream key',
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách stream keys',
    type: StreamKeyListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findAll(
    @Query() query: StreamKeyQueryDto,
  ): Promise<StreamKeyListResponseDto> {
    const { page = 1, limit = 10, match_id, user_id, status } = query;
    const result = await this.streamKeysService.findAll({
      page,
      limit,
      match_id,
      user_id,
      status,
    });
    return new StreamKeyListResponseDto(
      result.streamKeys,
      result.total,
      result.page,
      result.totalPages,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Lấy thông tin stream key',
    description: 'Lấy thông tin chi tiết của một stream key (Admin và Caster)',
  })
  @ApiParam({ name: 'id', description: 'ID của stream key' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin stream key',
    type: StreamKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findOne(@Param('id') id: string): Promise<StreamKeyResponseDto> {
    const streamKey = await this.streamKeysService.findOne(id);
    return new StreamKeyResponseDto(streamKey);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Cập nhật stream key',
    description: 'Cập nhật thông tin stream key (Admin và Caster)',
  })
  @ApiParam({ name: 'id', description: 'ID của stream key' })
  @ApiBody({ type: UpdateStreamKeyDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật stream key thành công',
    type: StreamKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async update(
    @Param('id') id: string,
    @Body() updateStreamKeyDto: UpdateStreamKeyDto,
  ): Promise<StreamKeyResponseDto> {
    const streamKey = await this.streamKeysService.update(
      id,
      updateStreamKeyDto,
    );
    return new StreamKeyResponseDto(streamKey);
  }

  @Post(':id/add-matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Thêm trận đấu vào stream key',
    description:
      'Thêm nhiều trận đấu vào stream key để lên lịch (Admin, Caster và Staff)',
  })
  @ApiParam({ name: 'id', description: 'ID của stream key' })
  @ApiBody({ type: AddMatchesToStreamKeyDto })
  @ApiResponse({
    status: 200,
    description: 'Thêm trận đấu thành công',
    type: StreamKeyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Trận đấu đã được gán cho stream key khác',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key hoặc trận đấu',
  })
  async addMatches(
    @Param('id') id: string,
    @Body() dto: AddMatchesToStreamKeyDto,
  ): Promise<StreamKeyResponseDto> {
    const streamKey = await this.streamKeysService.addMatches(
      id,
      dto.match_ids,
    );
    return new StreamKeyResponseDto(streamKey);
  }

  @Post(':id/remove-matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASTER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Xóa trận đấu khỏi stream key',
    description: 'Xóa nhiều trận đấu khỏi stream key (Admin, Caster và Staff)',
  })
  @ApiParam({ name: 'id', description: 'ID của stream key' })
  @ApiBody({ type: RemoveMatchesFromStreamKeyDto })
  @ApiResponse({
    status: 200,
    description: 'Xóa trận đấu thành công',
    type: StreamKeyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key',
  })
  async removeMatches(
    @Param('id') id: string,
    @Body() dto: RemoveMatchesFromStreamKeyDto,
  ): Promise<StreamKeyResponseDto> {
    const streamKey = await this.streamKeysService.removeMatches(
      id,
      dto.match_ids,
    );
    return new StreamKeyResponseDto(streamKey);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Xóa stream key',
    description: 'Xóa stream key khỏi hệ thống (Admin và Staff)',
  })
  @ApiParam({ name: 'id', description: 'ID của stream key' })
  @ApiResponse({
    status: 200,
    description: 'Xóa stream key thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Stream key deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream key',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.streamKeysService.remove(id);
    return { message: 'Stream key deleted successfully' };
  }
}
