import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/config/app-config.service';
import {
  UPLOAD_MICROSERVICE_PATTERNS,
  UploadImageRequest,
  UploadVideoRequest,
  DeleteUploadRequest,
  UploadResponse,
} from './interfaces/upload-microservice.interface';

@Injectable()
export class UploadMicroserviceClient {
  private readonly logger = new Logger(UploadMicroserviceClient.name);
  private readonly client: ClientProxy;

  constructor(private readonly configService: AppConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host:
          this.configService.nodeEnv === 'production'
            ? 'vaoluoi_upload'
            : 'localhost',
        port: this.configService.uploadMicroservicePort,
      },
    });
  }

  async uploadImage(data: UploadImageRequest): Promise<UploadResponse> {
    try {
      this.logger.log(`Sending upload image request for user: ${data.userId}`);
      const result = await firstValueFrom(
        this.client.send<UploadResponse>(
          UPLOAD_MICROSERVICE_PATTERNS.UPLOAD_IMAGE,
          data,
        ),
      );
      this.logger.log(`Upload image completed: ${result.upload_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Upload image failed: ${error.message}`);
      throw error;
    }
  }

  async uploadVideo(data: UploadVideoRequest): Promise<UploadResponse> {
    try {
      this.logger.log(`Sending upload video request for user: ${data.userId}`);
      const result = await firstValueFrom(
        this.client.send<UploadResponse>(
          UPLOAD_MICROSERVICE_PATTERNS.UPLOAD_VIDEO,
          data,
        ),
      );
      this.logger.log(`Upload video completed: ${result.upload_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Upload video failed: ${error.message}`);
      throw error;
    }
  }

  async deleteUpload(data: DeleteUploadRequest): Promise<UploadResponse> {
    try {
      this.logger.log(`Deleting upload: ${data.uploadId}`);
      const result = await firstValueFrom(
        this.client.send<UploadResponse>(
          UPLOAD_MICROSERVICE_PATTERNS.DELETE_UPLOAD,
          data,
        ),
      );
      this.logger.log(`Delete upload completed: ${result.upload_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Delete upload failed: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
