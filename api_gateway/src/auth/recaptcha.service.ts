import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/config/app-config.service';

export interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);

  constructor(private readonly httpService: HttpService) {
    this.logger.log(
      `reCAPTCHA service initialized - only checking token format`,
    );
  }

  /**
   * Kiểm tra reCAPTCHA token có tồn tại và hợp lệ cơ bản
   * Không gọi Google API - chỉ kiểm tra format cơ bản
   */
  async verifyToken(
    token: string,
    remoteIp?: string,
    expectedAction: string = 'register',
  ): Promise<RecaptchaVerificationResult> {
    this.logger.log(
      `Checking reCAPTCHA token format for action: ${expectedAction}`,
    );

    if (!token) {
      throw new HttpException(
        'reCAPTCHA token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new HttpException(
        'reCAPTCHA token must be a non-empty string',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra format cơ bản của token (thường bắt đầu với 03AFcWeA...)
    if (token.length < 10) {
      throw new HttpException(
        'reCAPTCHA token format appears invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `reCAPTCHA token format validation successful: token length=${token.length}`,
    );

    // Trả về kết quả giả lập để tương thích với interface
    return {
      success: true,
      score: 0.9, // Giả lập score cao
      action: expectedAction,
      challenge_ts: new Date().toISOString(),
      hostname: 'localhost',
    };
  }

  /**
   * Kiểm tra reCAPTCHA token với retry mechanism (đơn giản hóa)
   */
  async verifyTokenWithRetry(
    token: string,
    remoteIp?: string,
    expectedAction: string = 'register',
    maxRetries: number = 3,
  ): Promise<RecaptchaVerificationResult> {
    // Không cần retry vì chỉ kiểm tra format cơ bản
    this.logger.log(`Checking reCAPTCHA token format (no retry needed)`);
    return await this.verifyToken(token, remoteIp, expectedAction);
  }

  /**
   * Kiểm tra xem reCAPTCHA có được cấu hình không
   */
  isConfigured(): boolean {
    return true; // Luôn trả về true vì chỉ cần kiểm tra format
  }

  /**
   * Lấy ngưỡng điểm số hiện tại
   */
  getMinScoreThreshold(): number {
    return 0.5; // Giá trị mặc định
  }
}
