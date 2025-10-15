import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'healthy',
      service: 'security-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
