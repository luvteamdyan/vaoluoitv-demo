import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/schemas/user.schema';
import { AdsConfigService } from './ads-config.service';
import {
  CreateAdsConfigDto,
  UpdateAdsConfigDto,
  AdsConfigResponseDto,
  AdsConfigListResponseDto,
  AdsConfigQueryDto,
  AdsPosition,
} from './dto/ads-config.dto';

@ApiTags('Ads Config')
@Controller('api/v1/ads-config')
export class AdsConfigController {
  constructor(private readonly adsConfigService: AdsConfigService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Tạo cấu hình quảng cáo mới',
    description: 'Tạo cấu hình quảng cáo mới (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateAdsConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo cấu hình quảng cáo thành công',
    type: AdsConfigResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async create(
    @Body() createDto: CreateAdsConfigDto,
  ): Promise<AdsConfigResponseDto> {
    return this.adsConfigService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách cấu hình quảng cáo',
    description:
      'Lấy danh sách tất cả cấu hình quảng cáo với paging và filtering (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
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
    name: 'position',
    required: false,
    description: 'Vị trí quảng cáo',
    enum: AdsPosition,
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Trạng thái hoạt động',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cấu hình quảng cáo',
    type: AdsConfigListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findAll(
    @Query() query: AdsConfigQueryDto,
  ): Promise<AdsConfigListResponseDto> {
    return this.adsConfigService.findAll(query);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Lấy quảng cáo đang hoạt động',
    description: 'Lấy danh sách các quảng cáo đang hoạt động (public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách quảng cáo đang hoạt động',
    type: [AdsConfigResponseDto],
  })
  async getActiveAds(): Promise<AdsConfigResponseDto[]> {
    return this.adsConfigService.getActiveAds();
  }

  @Get('position/:position')
  @ApiOperation({
    summary: 'Lấy quảng cáo theo vị trí',
    description: 'Lấy quảng cáo đang hoạt động tại vị trí cụ thể (public)',
  })
  @ApiParam({
    name: 'position',
    description: 'Vị trí quảng cáo',
    enum: AdsPosition,
  })
  @ApiResponse({
    status: 200,
    description: 'Quảng cáo tại vị trí',
    type: AdsConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy quảng cáo tại vị trí này',
  })
  async findByPosition(
    @Param('position') position: AdsPosition,
  ): Promise<AdsConfigResponseDto | null> {
    return this.adsConfigService.findByPosition(position);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy thông tin cấu hình quảng cáo',
    description:
      'Lấy thông tin chi tiết của một cấu hình quảng cáo (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID của cấu hình quảng cáo' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin cấu hình quảng cáo',
    type: AdsConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cấu hình quảng cáo',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findOne(@Param('id') id: string): Promise<AdsConfigResponseDto> {
    return this.adsConfigService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Cập nhật cấu hình quảng cáo',
    description: 'Cập nhật thông tin cấu hình quảng cáo (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID của cấu hình quảng cáo' })
  @ApiBody({ type: UpdateAdsConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật cấu hình quảng cáo thành công',
    type: AdsConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cấu hình quảng cáo',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdsConfigDto,
  ): Promise<AdsConfigResponseDto> {
    return this.adsConfigService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Xóa cấu hình quảng cáo',
    description: 'Xóa cấu hình quảng cáo khỏi hệ thống (Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID của cấu hình quảng cáo' })
  @ApiResponse({
    status: 200,
    description: 'Xóa cấu hình quảng cáo thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cấu hình quảng cáo',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.adsConfigService.remove(id);
  }

  @Post(':id/click')
  @ApiOperation({
    summary: 'Theo dõi click quảng cáo',
    description: 'Theo dõi số lần click vào quảng cáo (public)',
  })
  @ApiParam({ name: 'id', description: 'ID của cấu hình quảng cáo' })
  @ApiResponse({
    status: 200,
    description: 'Theo dõi click thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cấu hình quảng cáo',
  })
  async trackClick(@Param('id') id: string): Promise<void> {
    return this.adsConfigService.incrementClickCount(id);
  }
}
