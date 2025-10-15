import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadService } from './upload.service';
import * as uploadMicroserviceInterface from '../interfaces/upload-microservice.interface';
import { Readable } from 'stream';

@Controller()
export class UploadMicroserviceController {
  constructor(private readonly uploadService: UploadService) {}

  @MessagePattern(
    uploadMicroserviceInterface.UPLOAD_MICROSERVICE_PATTERNS.UPLOAD_IMAGE,
  )
  async uploadImage(
    @Payload() data: uploadMicroserviceInterface.UploadImageRequest,
  ): Promise<uploadMicroserviceInterface.UploadResponse> {
    const fileBuffer = Buffer.isBuffer(data.file.buffer)
      ? data.file.buffer
      : Buffer.from(data.file.buffer);

    const file = {
      fieldname: 'file',
      originalname: data.file.originalname,
      encoding: '7bit',
      mimetype: data.file.mimetype,
      size: data.file.size,
      buffer: fileBuffer,
      stream: Readable.from(fileBuffer),
      destination: '',
      filename: '',
      path: '',
    };

    const result = await this.uploadService.uploadImage(
      file,
      data.userId,
      data.metadata,
      data.responsiveDimensions,
      data.generateResponsive,
    );

    return {
      upload_id: result.upload_id,
      user_id: data.userId,
      file_name: result.file_name,
      original_name: data.file.originalname,
      mime_type: data.file.mimetype,
      file_size: data.file.size,
      file_type: 'image',
      url: result.url,
      responsive_variants: result.responsive_variants,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @MessagePattern(
    uploadMicroserviceInterface.UPLOAD_MICROSERVICE_PATTERNS.UPLOAD_VIDEO,
  )
  async uploadVideo(
    @Payload() data: uploadMicroserviceInterface.UploadVideoRequest,
  ): Promise<uploadMicroserviceInterface.UploadResponse> {
    const fileBuffer = Buffer.isBuffer(data.file.buffer)
      ? data.file.buffer
      : Buffer.from(data.file.buffer);

    const file = {
      fieldname: 'file',
      originalname: data.file.originalname,
      encoding: '7bit',
      mimetype: data.file.mimetype,
      size: data.file.size,
      buffer: fileBuffer,
      stream: Readable.from(fileBuffer),
      destination: '',
      filename: '',
      path: '',
    };

    const result = await this.uploadService.uploadVideo(
      file,
      data.userId,
      data.metadata,
      data.responsiveDimensions,
      data.generateResponsive,
    );

    return {
      upload_id: result.upload_id,
      user_id: data.userId,
      file_name: result.file_name,
      original_name: data.file.originalname,
      mime_type: data.file.mimetype,
      file_size: data.file.size,
      file_type: 'video',
      url: result.url,
      responsive_variants: result.responsive_variants,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @MessagePattern(
    uploadMicroserviceInterface.UPLOAD_MICROSERVICE_PATTERNS.DELETE_UPLOAD,
  )
  async deleteUpload(
    @Payload() data: uploadMicroserviceInterface.DeleteUploadRequest,
  ): Promise<uploadMicroserviceInterface.UploadResponse> {
    const result = await this.uploadService.deleteUpload(
      data.uploadId,
      data.userId,
      data.fileUrl,
    );

    return {
      upload_id: result.upload_id,
      user_id: data.userId,
      file_name: result.file_name,
      original_name: result.original_name,
      mime_type: result.mime_type,
      file_size: result.file_size,
      file_type: result.file_type,
      url: result.url,
      responsive_variants: result.responsive_variants,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
