import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Deprecated: Sử dụng environment variables thay vì hardcode enum
// @deprecated - Sử dụng getStreamKeyById() method thay thế
export enum EvgCdnStreamKey {
  VAOLUOITV1 = 'vaoluoitv1',
  VAOLUOITV2 = 'vaoluoitv2',
  VAOLUOITV3 = 'vaoluoitv3',
  VAOLUOITV4 = 'vaoluoitv4',
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get mongodbUri(): string {
    return (
      this.configService.get<string>('MONGODB_URI') ||
      'mongodb://localhost:27017/vaoluoi-security'
    );
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3001;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get secretKey(): string {
    return (
      this.configService.get<string>('SECRET_KEY') || 'default-stream-secret'
    );
  }

  get baseUrl(): string {
    return (
      this.configService.get<string>('BASE_URL') || 'https://live.vaoluoitv.com'
    );
  }

  get apiKey(): string {
    return this.configService.get<string>('SECURE_API_KEY') || 'default-api-key';
  }

  // Deprecated methods - giữ lại để backward compatibility
  get evgcdnSk1(): string {
    return EvgCdnStreamKey.VAOLUOITV1;
  }

  get evgcdnSk2(): string {
    return EvgCdnStreamKey.VAOLUOITV2;
  }

  /**
   * Lấy stream key theo ID một cách động từ environment variables
   * Format: EVGCDN_SK_{ID} (ví dụ: EVGCDN_SK_1, EVGCDN_SK_2, EVGCDN_SK_5)
   *
   * @param id - ID của stream key (string hoặc number)
   * @returns Stream key value hoặc null nếu không tìm thấy
   */
  getStreamKeyById(id: string | number): string | null {
    const envKey = `EVGCDN_SK_${id}`;
    return this.configService.get<string>(envKey) || null;
  }

  /**
   * Lấy tất cả stream keys được cấu hình từ environment variables
   * @returns Object với key là ID và value là stream key
   */
  getAllStreamKeys(): Record<string, string> {
    const streamKeys: Record<string, string> = {};

    // Lấy tất cả environment variables có pattern EVGCDN_SK_*
    const env = process.env;
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith('EVGCDN_SK_') && value) {
        const id = key.replace('EVGCDN_SK_', '');
        streamKeys[id] = value;
      }
    }

    return streamKeys;
  }

  /**
   * Kiểm tra xem stream key ID có tồn tại không
   * @param id - ID của stream key
   * @returns boolean
   */
  hasStreamKey(id: string | number): boolean {
    return this.getStreamKeyById(id) !== null;
  }

  get evgcdnSecretKey(): string {
    return this.configService.get<string>('EVGCDN_SECRET_KEY') || 's3cret';
  }

  get evgcdnHlsBaseUrl(): string {
    return (
      this.configService.get<string>('EVGCDN_HLS_BASE_URL') ||
      'https://3014759347.global.cdnfastest.com'
    );
  }

  get evgcdnFlvBaseUrl(): string {
    return (
      this.configService.get<string>('EVGCDN_FLV_BASE_URL') ||
      'https://3014973486.global.cdnfastest.com'
    );
  }

  // Keep backward compatibility
  get evgcdnBaseUrl(): string {
    return this.evgcdnHlsBaseUrl;
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey === this.apiKey;
  }
}
