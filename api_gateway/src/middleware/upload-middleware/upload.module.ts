import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadMicroserviceClient } from './upload-microservice.client';
import { Upload, UploadSchema } from '@/schemas/upload.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
    HttpModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadMicroserviceClient],
  exports: [UploadService, UploadMicroserviceClient],
})
export class UploadModule {}
