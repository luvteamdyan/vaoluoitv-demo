import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import {
  UrlValidateRequestDto,
  MultipleUrlsRequestDto,
  CdnUrlSignRequestDto,
} from './dto/security.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api/v1/security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  constructor(private readonly securityService: SecurityService) {}

  /**
   * Validate URL signature
   * POST /api/v1/security/validate
   */
  @Post('validate')
  @UseGuards(ApiKeyGuard)
  async validateUrl(@Body() body: UrlValidateRequestDto) {
    this.logger.log(`Validating URL signature for path: ${body.path}`);

    try {
      const result = await this.securityService.validateUrl(body);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error validating URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get stream info with signed URL
   * GET /api/v1/security/stream/:id
   */
  @Get('stream/:id')
  @UseGuards(ApiKeyGuard)
  async getStreamInfo(@Param('id') streamId: string) {
    this.logger.log(`Getting stream info for: ${streamId}`);

    try {
      const result = await this.securityService.getStreamInfo(streamId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error getting stream info: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Generate multiple signed URLs for different formats
   * POST /api/v1/security/stream/:id/urls
   */
  @Post('stream/:id/urls')
  @UseGuards(ApiKeyGuard)
  async generateMultipleUrls(
    @Param('id') streamId: string,
    @Body() body: MultipleUrlsRequestDto,
  ) {
    this.logger.log(`Generating multiple URLs for stream: ${streamId}`);

    try {
      const result = await this.securityService.generateMultipleUrls(
        streamId,
        body,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error generating multiple URLs: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Generate multiple signed URLs for CDN (EVGCDN)
   * POST /api/v1/security/cdn/:id/urls
   */
  @Post('cdn/:id/urls')
  @UseGuards(ApiKeyGuard)
  generateCdnUrls(
    @Param('id') cdnId: string,
    @Body() body: CdnUrlSignRequestDto,
  ) {
    this.logger.log(`Generating CDN URLs for: ${cdnId}`);

    try {
      const result = this.securityService.generateCdnUrls(cdnId, body);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error generating CDN URLs: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Health check endpoint
   * GET /api/v1/security/health
   */
  @Get('health')
  @UseGuards(ApiKeyGuard)
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'security-api',
    };
  }
}
