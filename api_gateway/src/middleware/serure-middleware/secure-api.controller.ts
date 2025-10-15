import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SecureApiService } from './secure-api.service';
import {
  UrlValidateRequestDto,
  MultipleUrlsRequestDto,
  CdnUrlSignRequestDto,
} from './dto/secure-api.dto';

@ApiTags('Secure API')
@Controller('api/v1/security')
export class SecureApiController {
  private readonly logger = new Logger(SecureApiController.name);

  constructor(private readonly secureApiService: SecureApiService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Xác thực URL đã ký (Public)',
    description: 'Xác thực tính hợp lệ của URL đã ký',
  })
  @ApiBody({ type: UrlValidateRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Xác thực URL thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            expiresAt: { type: 'string', example: '2024-01-01T01:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'URL không hợp lệ hoặc đã hết hạn',
  })
  async validateUrl(@Body() body: UrlValidateRequestDto) {
    this.logger.log(`Validating URL signature for path: ${body.path}`);

    try {
      const result = await this.secureApiService.validateUrl(body);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error validating URL: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('stream/:id')
  @ApiOperation({
    summary: 'Lấy thông tin stream (Public)',
    description: 'Lấy thông tin stream với URL đã ký',
  })
  @ApiParam({ name: 'id', description: 'ID của stream' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin stream',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            streamId: { type: 'string', example: 'match_123' },
            status: { type: 'string', example: 'live' },
            url: {
              type: 'string',
              example: 'https://stream.example.com/live.flv?token=...',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy stream',
  })
  async getStreamInfo(@Param('id') streamId: string) {
    this.logger.log(`Getting stream info for: ${streamId}`);

    try {
      const result = await this.secureApiService.getStreamInfo(streamId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error getting stream info: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('stream/:id/urls')
  @ApiOperation({
    summary: 'Tạo nhiều URL đã ký (Public)',
    description: 'Tạo nhiều URL đã ký cho các định dạng khác nhau',
  })
  @ApiParam({ name: 'id', description: 'ID của stream' })
  @ApiBody({ type: MultipleUrlsRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Tạo nhiều URL thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  format: { type: 'string', example: 'flv' },
                  url: {
                    type: 'string',
                    example: 'https://stream.example.com/live.flv?token=...',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  async generateMultipleUrls(
    @Param('id') streamId: string,
    @Body() body: MultipleUrlsRequestDto,
  ) {
    this.logger.log(`Generating multiple URLs for stream: ${streamId}`);

    try {
      const result = await this.secureApiService.generateMultipleUrls(
        streamId,
        body,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error generating multiple URLs: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('cdn/:id/urls')
  @ApiOperation({
    summary: 'Tạo URL đã ký cho CDN (Public)',
    description: 'Tạo URL đã ký cho CDN EVGCDN với các định dạng khác nhau',
  })
  @ApiParam({ name: 'id', description: 'ID của CDN (1 hoặc 2)' })
  @ApiBody({ type: CdnUrlSignRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Tạo URL CDN thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            m3u8: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example:
                    'https://3014759347.global.cdnfastest.com/vaoluoitv/vaoluoitv1/index.m3u8?token=xxx&time=xxx',
                },
                token: { type: 'string', example: 'abc123' },
                time: { type: 'number', example: 1640995200 },
                expiresAt: {
                  type: 'string',
                  example: '2024-01-01T01:00:00.000Z',
                },
              },
            },
            flv: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example:
                    'https://3014759347.global.cdnfastest.com/vaoluoitv/vaoluoitv1.flv?token=xxx&time=xxx',
                },
                token: { type: 'string', example: 'abc123' },
                time: { type: 'number', example: 1640995200 },
                expiresAt: {
                  type: 'string',
                  example: '2024-01-01T01:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  async generateCdnUrls(
    @Param('id') cdnId: string,
    @Body() body: CdnUrlSignRequestDto,
  ) {
    this.logger.log(`Generating CDN URLs for: ${cdnId}`);

    try {
      const result = await this.secureApiService.generateCdnUrls(cdnId, body);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error generating CDN URLs: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check secure API (Public)',
    description: 'Kiểm tra trạng thái hoạt động của secure API',
  })
  @ApiResponse({
    status: 200,
    description: 'Secure API đang hoạt động bình thường',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Secure API không khả dụng',
  })
  async healthCheck() {
    try {
      const result = await this.secureApiService.healthCheck();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error checking secure API health: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Secure API is not available',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
