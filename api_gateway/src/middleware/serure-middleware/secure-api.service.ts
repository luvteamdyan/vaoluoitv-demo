import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/config/app-config.service';
import {
  UrlSignResponseDto,
  UrlValidateRequestDto,
  UrlValidateResponseDto,
  StreamInfoResponseDto,
  MultipleUrlsRequestDto,
  CdnUrlSignRequestDto,
  CdnUrlSignResponseDto,
  SecureApiResponse,
} from './dto/secure-api.dto';

@Injectable()
export class SecureApiService {
  private readonly logger = new Logger(SecureApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {
    this.baseUrl = this.configService.secureApiBaseUrl;
    this.apiKey = this.configService.secureApiKey;
  }

  /**
   * Validate URL signature
   */
  async validateUrl(
    request: UrlValidateRequestDto,
  ): Promise<UrlValidateResponseDto> {
    this.logger.log(`Validating URL signature for path: ${request.path}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<SecureApiResponse<UrlValidateResponseDto>>(
          `${this.baseUrl}/api/v1/security/validate`,
          request,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
            },
          },
        ),
      );

      if (!response.data.success) {
        throw new HttpException(
          response.data.message || 'Failed to validate URL',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response.data.data) {
        throw new HttpException(
          'No data returned from secure API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error validating URL: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to validate URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get stream info with signed URL
   */
  async getStreamInfo(streamId: string): Promise<StreamInfoResponseDto> {
    this.logger.log(`Getting stream info for: ${streamId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<SecureApiResponse<StreamInfoResponseDto>>(
          `${this.baseUrl}/api/v1/security/stream/${streamId}`,
          {
            headers: {
              'x-api-key': this.apiKey,
            },
          },
        ),
      );

      if (!response.data.success) {
        throw new HttpException(
          response.data.message || 'Failed to get stream info',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!response.data.data) {
        throw new HttpException(
          'No data returned from secure API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error getting stream info: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get stream info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate multiple signed URLs for different formats
   */
  async generateMultipleUrls(
    streamId: string,
    request: MultipleUrlsRequestDto,
  ): Promise<Record<string, UrlSignResponseDto>> {
    this.logger.log(`Generating multiple URLs for stream: ${streamId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<
          SecureApiResponse<Record<string, UrlSignResponseDto>>
        >(`${this.baseUrl}/api/v1/security/stream/${streamId}/urls`, request, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        }),
      );

      if (!response.data.success) {
        throw new HttpException(
          response.data.message || 'Failed to generate multiple URLs',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response.data.data) {
        throw new HttpException(
          'No data returned from secure API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error generating multiple URLs: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate multiple URLs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate CDN URLs for EVGCDN
   */
  async generateCdnUrls(
    cdnId: string,
    request: CdnUrlSignRequestDto,
  ): Promise<Record<string, CdnUrlSignResponseDto>> {
    this.logger.log(`Generating CDN URLs for: ${cdnId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<
          SecureApiResponse<Record<string, CdnUrlSignResponseDto>>
        >(`${this.baseUrl}/api/v1/security/cdn/${cdnId}/urls`, request, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        }),
      );

      if (!response.data.success) {
        throw new HttpException(
          response.data.message || 'Failed to generate CDN URLs',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response.data.data) {
        throw new HttpException(
          'No data returned from secure API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error generating CDN URLs: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate CDN URLs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for secure API
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    this.logger.log('Checking secure API health');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/security/health`, {
          headers: {
            'x-api-key': this.apiKey,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error checking secure API health: ${error.message}`);
      throw new HttpException(
        'Secure API is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
