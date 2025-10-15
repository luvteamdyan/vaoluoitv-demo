import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/config/app-config.service';
import {
  WebhookRequestDto,
  WebhookLoginRequestDto,
  WebhookResponseDto,
} from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly authWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {
    this.authWebhookUrl = `${configService.authWebhookUrl}`;
  }

  /**
   * Extract thông tin lỗi chi tiết từ webhook response
   */
  private extractWebhookError(webhookResponse: any): {
    field?: string;
    message?: string;
    code?: string;
    details?: any;
  } {
    if (!webhookResponse) return {};

    // Xử lý các format lỗi khác nhau từ webhook
    if (webhookResponse.error) {
      // Format: { error: "Phone number already exists" }
      return {
        message: webhookResponse.error,
        details: webhookResponse,
      };
    }

    if (webhookResponse.message) {
      // Format: { message: "Validation failed", details: { phone_number: ["already exists"] } }
      const details = webhookResponse.details || {};
      const firstField = Object.keys(details)[0];
      const firstError = Array.isArray(details[firstField])
        ? details[firstField][0]
        : details[firstField];

      return {
        field: firstField,
        message: firstError || webhookResponse.message,
        code: webhookResponse.code,
        details: webhookResponse,
      };
    }

    if (webhookResponse.details) {
      // Format: { details: { phone_number: ["already exists"] } }
      const firstField = Object.keys(webhookResponse.details)[0];
      const firstError = Array.isArray(webhookResponse.details[firstField])
        ? webhookResponse.details[firstField][0]
        : webhookResponse.details[firstField];

      return {
        field: firstField,
        message: firstError,
        details: webhookResponse,
      };
    }

    return {
      message: webhookResponse.toString(),
      details: webhookResponse,
    };
  }

  /**
   * Gửi dữ liệu người dùng đến auth webhook endpoint để đăng ký (V2)
   */
  async registerV2(userData: WebhookRequestDto): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Sending user data to auth webhook:`, userData);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authWebhookUrl}/auth/v2/register`,
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
          },
        ),
      );

      this.logger.log(
        `Auth webhook V2 response received for user: ${userData.email}`,
      );

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        message: 'User data sent successfully (V2)',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send user data to auth webhook: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        // Server responded with error status - lưu chi tiết lỗi từ webhook
        const webhookResponse = error.response.data;
        const webhookError = this.extractWebhookError(webhookResponse);

        this.logger.error(
          `Webhook V2 error details for user ${userData.email}:`,
          JSON.stringify(webhookResponse, null, 2),
        );

        throw new HttpException(
          {
            success: false,
            message:
              webhookResponse?.message || 'Auth webhook V2 request failed',
            error:
              webhookResponse?.message ||
              error.response.data?.message ||
              error.message,
            statusCode: error.response.status,
            webhookError,
            webhookResponse,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new HttpException(
          {
            success: false,
            message: 'No response from auth webhook endpoint',
            error: 'Network error or timeout',
            statusCode: HttpStatus.REQUEST_TIMEOUT,
          },
          HttpStatus.REQUEST_TIMEOUT,
        );
      } else {
        // Something else happened
        throw new HttpException(
          {
            success: false,
            message: 'Auth webhook V2 request failed',
            error: error.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Gửi dữ liệu người dùng đến auth webhook endpoint để đăng ký (V1)
   */
  async registerV1(userData: WebhookRequestDto): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Sending user data to auth webhook V1:`, userData);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authWebhookUrl}/auth/register`,
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
          },
        ),
      );

      this.logger.log(
        `Auth webhook V1 response received for user: ${userData.email}`,
      );

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        message: 'User data sent successfully (V1)',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send user data to auth webhook V1: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        // Server responded with error status - lưu chi tiết lỗi từ webhook
        const webhookResponse = error.response.data;
        const webhookError = this.extractWebhookError(webhookResponse);

        this.logger.error(
          `Webhook V1 error details for user ${userData.email}:`,
          JSON.stringify(webhookResponse, null, 2),
        );

        throw new HttpException(
          {
            success: false,
            message: webhookResponse?.message || 'Đăng ký thất bại',
            error:
              webhookResponse?.message ||
              error.response.data?.message ||
              error.message,
            statusCode: error.response.status,
            webhookError,
            webhookResponse,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new HttpException(
          {
            success: false,
            message: 'Không nhận được phản hồi từ luck8event.com',
            error: 'Network error or timeout',
            statusCode: HttpStatus.REQUEST_TIMEOUT,
          },
          HttpStatus.REQUEST_TIMEOUT,
        );
      } else {
        // Something else happened
        throw new HttpException(
          {
            success: false,
            message: 'Đăng ký thất bại',
            error: error.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Gửi login request đến auth webhook endpoint
   */
  async sendLoginRequest(
    loginData: WebhookLoginRequestDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Sending login request to auth webhook: ${loginData.identifier}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(`${this.authWebhookUrl}/auth/login`, loginData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }),
      );

      this.logger.log(
        `Auth webhook login response received for user: ${loginData.identifier}`,
      );

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        message: 'Login request sent successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send login request to auth webhook: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        // Server responded with error status
        throw new HttpException(
          {
            success: false,
            message: 'Auth webhook login request failed',
            error: error.response.data,
            statusCode: error.response.status,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new HttpException(
          {
            success: false,
            message: 'No response from auth webhook endpoint',
            error: 'Network error or timeout',
            statusCode: HttpStatus.REQUEST_TIMEOUT,
          },
          HttpStatus.REQUEST_TIMEOUT,
        );
      } else {
        // Something else happened
        throw new HttpException(
          {
            success: false,
            message: 'Auth webhook login request failed',
            error: error.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Lấy thông tin user profile từ auth webhook endpoint
   */
  async getUserProfile(accessToken: string): Promise<WebhookResponseDto> {
    try {
      this.logger.log(`Getting user profile from auth webhook`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.authWebhookUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }),
      );

      this.logger.log(`User profile response received from auth webhook`);

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        message: 'User profile retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user profile from auth webhook: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        // Server responded with error status
        throw new HttpException(
          {
            success: false,
            message: 'Auth webhook user profile request failed',
            error: error.response.data,
            statusCode: error.response.status,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new HttpException(
          {
            success: false,
            message: 'No response from auth webhook user profile endpoint',
            error: 'Network error or timeout',
            statusCode: HttpStatus.REQUEST_TIMEOUT,
          },
          HttpStatus.REQUEST_TIMEOUT,
        );
      } else {
        // Something else happened
        throw new HttpException(
          {
            success: false,
            message: 'Auth webhook user profile request failed',
            error: error.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
