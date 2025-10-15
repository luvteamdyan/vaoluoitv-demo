import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhookService } from '@/webhook/webhook.service';
import {
  WebhookRequestDto,
  WebhookLoginRequestDto,
  WebhookResponseDto,
  WebhookErrorDto,
} from './dto/webhook.dto';

@ApiTags('Webhook')
@Controller('api/v1/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('register-v2')
  @ApiOperation({
    summary: 'Gửi dữ liệu người dùng đến auth webhook endpoint (V2)',
    description:
      'Gửi thông tin người dùng đến endpoint https://auth.luck8event.com/api/v1/auth/v2/register và trả về response',
  })
  @ApiBody({
    type: WebhookRequestDto,
    description: 'Dữ liệu người dùng cần gửi',
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi dữ liệu thành công',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
    type: WebhookErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi server hoặc auth webhook endpoint không phản hồi',
    type: WebhookErrorDto,
  })
  async registerV2(
    @Body() userData: WebhookRequestDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Received request to register user V2: ${userData.email}`,
      );

      const result = await this.webhookService.registerV2(userData);

      this.logger.log(`Successfully registered user V2: ${userData.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to register user V2: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Internal server error',
          error: error.message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register-v1')
  @ApiOperation({
    summary: 'Gửi dữ liệu người dùng đến auth webhook endpoint (V1)',
    description:
      'Gửi thông tin người dùng đến endpoint https://auth.luck8event.com/api/v1/auth/register và trả về response',
  })
  @ApiBody({
    type: WebhookRequestDto,
    description: 'Dữ liệu người dùng cần gửi',
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi dữ liệu thành công',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
    type: WebhookErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi server hoặc auth webhook endpoint không phản hồi',
    type: WebhookErrorDto,
  })
  async registerV1(
    @Body() userData: WebhookRequestDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Received request to register user V1: ${userData.email}`,
      );

      const result = await this.webhookService.registerV1(userData);

      this.logger.log(`Successfully registered user V1: ${userData.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to register user V1: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Internal server error',
          error: error.message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-login-request')
  @ApiOperation({
    summary: 'Gửi login request đến auth webhook endpoint',
    description:
      'Gửi thông tin đăng nhập đến endpoint https://auth.luck8event.com/api/v1/auth/login và trả về response',
  })
  @ApiBody({
    type: WebhookLoginRequestDto,
    description: 'Dữ liệu đăng nhập cần gửi',
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi login request thành công',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
    type: WebhookErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi server hoặc auth webhook endpoint không phản hồi',
    type: WebhookErrorDto,
  })
  async sendLoginRequest(
    @Body() loginData: WebhookLoginRequestDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Received request to send login data: ${loginData.identifier}`,
      );

      const result = await this.webhookService.sendLoginRequest(loginData);

      this.logger.log(`Successfully sent login data: ${loginData.identifier}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send login data: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Internal server error',
          error: error.message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
