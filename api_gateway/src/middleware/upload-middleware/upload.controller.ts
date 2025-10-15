import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/schemas/user.schema';
import { UploadService } from './upload.service';
import {
  UploadResponseDto,
  UploadListResponseDto,
  UploadQueryDto,
  UploadStatsDto,
  UploadMetadataDto,
} from './dto/upload.dto';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload hình ảnh',
    description:
      'Upload file hình ảnh (JPEG, PNG, GIF, WebP) - tối đa 50MB. Hỗ trợ tạo responsive variants với kích thước tùy chỉnh.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh',
        },
        metadata: {
          type: 'object',
          description: 'Metadata của file',
          properties: {
            title: { type: 'string', description: 'Tiêu đề file' },
            description: { type: 'string', description: 'Mô tả file' },
            category: { type: 'string', description: 'Danh mục file' },
            subcategory: { type: 'string', description: 'Danh mục con' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Các thẻ tag',
            },
            custom_data: { type: 'object', description: 'Dữ liệu tùy chỉnh' },
            responsiveDimensions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'mobile' },
                  width: { type: 'number', example: 480 },
                  height: { type: 'number', example: 640 },
                  quality: { type: 'number', example: 80 },
                },
              },
              description: 'Kích thước responsive tùy chỉnh',
            },
            generateResponsive: {
              type: 'boolean',
              example: true,
              description: 'Có tạo responsive variants không',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload hình ảnh thành công',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc quá lớn',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Parse metadata from form data
    const metadata: UploadMetadataDto = {
      title: body.title,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      tags: body.tags
        ? typeof body.tags === 'string'
          ? body.tags.split(',')
          : body.tags
        : undefined,
      custom_data: body.custom_data
        ? typeof body.custom_data === 'string'
          ? JSON.parse(body.custom_data)
          : body.custom_data
        : undefined,
      responsiveDimensions: body.responsiveDimensions
        ? typeof body.responsiveDimensions === 'string'
          ? JSON.parse(body.responsiveDimensions)
          : body.responsiveDimensions
        : undefined,
      generateResponsive:
        body.generateResponsive === 'true' || body.generateResponsive === true,
    };

    return this.uploadService.uploadImage(file, req.user.id, metadata);
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload video',
    description:
      'Upload file video (MP4, WebM, AVI, MOV) - tối đa 100MB. Hỗ trợ tạo responsive variants với kích thước tùy chỉnh.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File video',
        },
        metadata: {
          type: 'object',
          description: 'Metadata của file',
          properties: {
            title: { type: 'string', description: 'Tiêu đề file' },
            description: { type: 'string', description: 'Mô tả file' },
            category: { type: 'string', description: 'Danh mục file' },
            subcategory: { type: 'string', description: 'Danh mục con' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Các thẻ tag',
            },
            custom_data: { type: 'object', description: 'Dữ liệu tùy chỉnh' },
            responsiveDimensions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'mobile' },
                  width: { type: 'number', example: 480 },
                  height: { type: 'number', example: 640 },
                  quality: { type: 'number', example: 80 },
                },
              },
              description: 'Kích thước responsive tùy chỉnh',
            },
            generateResponsive: {
              type: 'boolean',
              example: true,
              description: 'Có tạo responsive variants không',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload video thành công',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc quá lớn',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Parse metadata from form data
    const metadata: UploadMetadataDto = {
      title: body.title,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      tags: body.tags
        ? typeof body.tags === 'string'
          ? body.tags.split(',')
          : body.tags
        : undefined,
      custom_data: body.custom_data
        ? typeof body.custom_data === 'string'
          ? JSON.parse(body.custom_data)
          : body.custom_data
        : undefined,
      responsiveDimensions: body.responsiveDimensions
        ? typeof body.responsiveDimensions === 'string'
          ? JSON.parse(body.responsiveDimensions)
          : body.responsiveDimensions
        : undefined,
      generateResponsive:
        body.generateResponsive === 'true' || body.generateResponsive === true,
    };

    return this.uploadService.uploadVideo(file, req.user.id, metadata);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách uploads',
    description: 'Lấy danh sách các file đã upload của người dùng hiện tại',
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
    name: 'file_type',
    required: false,
    description: 'Loại file',
    example: 'image',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách uploads',
    type: UploadListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async findAll(
    @Query() query: UploadQueryDto,
    @Request() req: any,
  ): Promise<UploadListResponseDto> {
    return this.uploadService.findAll(query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin upload',
    description: 'Lấy thông tin chi tiết của một file đã upload',
  })
  @ApiParam({ name: 'id', description: 'ID của upload' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin upload',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy upload',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async findOne(
    @Param('id') uploadId: string,
    @Request() req: any,
  ): Promise<UploadResponseDto> {
    return this.uploadService.findOne(uploadId, req.user.id);
  }

  @Get('stats/summary')
  @ApiOperation({
    summary: 'Lấy thống kê uploads',
    description: 'Lấy thống kê uploads của người dùng hiện tại',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê uploads',
    type: UploadStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async getUploadStats(@Request() req: any): Promise<UploadStatsDto> {
    return this.uploadService.getUploadStats(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa upload',
    description: 'Xóa file đã upload',
  })
  @ApiParam({ name: 'id', description: 'ID của upload' })
  @ApiResponse({
    status: 204,
    description: 'Xóa upload thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy upload',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  async deleteUpload(
    @Param('id') uploadId: string,
    @Request() req: any,
  ): Promise<void> {
    await this.uploadService.deleteUpload(uploadId, req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy tất cả uploads (Admin)',
    description: 'Lấy danh sách tất cả uploads trong hệ thống (Admin only)',
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
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả uploads',
    type: UploadListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async findAllAdmin(
    @Query() query: UploadQueryDto,
  ): Promise<UploadListResponseDto> {
    return this.uploadService.findAll(query, 'admin');
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy thống kê tổng quan (Admin)',
    description: 'Lấy thống kê uploads của toàn hệ thống (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê tổng quan',
    type: UploadStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async getAdminStats(): Promise<UploadStatsDto> {
    return this.uploadService.getUploadStats('admin');
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa upload bất kỳ (Admin)',
    description: 'Xóa bất kỳ upload nào trong hệ thống (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'ID của upload' })
  @ApiResponse({
    status: 204,
    description: 'Xóa upload thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy upload',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async deleteUploadAdmin(@Param('id') uploadId: string): Promise<void> {
    await this.uploadService.deleteUpload(uploadId, 'admin');
  }
}
