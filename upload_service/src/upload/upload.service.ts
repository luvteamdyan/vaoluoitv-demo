import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { UploadResponseDto } from '../dto/upload.dto';
import { AppConfigService } from '../config/config.service';
import { ResponsiveDimension } from '../interfaces/upload-microservice.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: AppConfigService) {
    const r2Config = this.configService.r2;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: r2Config.endpoint,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });
    this.bucketName = r2Config.bucketName;
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    metadata?: Record<string, unknown>,
    responsiveDimensions?: ResponsiveDimension[],
    generateResponsive?: boolean,
  ): Promise<UploadResponseDto> {
    try {
      const uploadId = metadata?.title
        ? this.sanitizeFileName(metadata.title as string)
        : Date.now().toString();
      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `${uploadId}.${fileExtension}`;

      // Upload original file
      const originalKey = `images/${fileName}`;
      await this.uploadToR2(originalKey, file.buffer, file.mimetype);

      const cdnUrl = `${this.configService.cdn.baseUrl}/${encodeURIComponent(originalKey)}`;

      // Generate responsive variants if requested
      const responsiveVariants: any[] = [];
      if (generateResponsive && responsiveDimensions) {
        for (const dimension of responsiveDimensions) {
          try {
            const variantFileName = `${uploadId}_${dimension.name}.${fileExtension}`;
            const variantKey = `images/variants/${variantFileName}`;

            // For simplicity, we'll just copy the original file
            // In production, you might want to resize the image
            await this.uploadToR2(variantKey, file.buffer, file.mimetype);

            const variantUrl = `${this.configService.cdn.baseUrl}/${encodeURIComponent(variantKey)}`;
            responsiveVariants.push({
              name: dimension.name,
              width: dimension.width,
              height: dimension.height,
              url: variantUrl,
              size: file.buffer.length,
              quality: dimension.quality,
            });
          } catch (error) {
            this.logger.warn(
              `Failed to generate variant ${dimension.name}: ${String(error)}`,
            );
          }
        }
      }

      return {
        upload_id: uploadId,
        user_id: userId,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        file_type: 'image',
        url: cdnUrl,
        responsive_variants:
          responsiveVariants.length > 0 ? responsiveVariants : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Image upload failed: ${String(error)}`);
      throw new BadRequestException('Upload failed');
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    userId: string,
    metadata?: Record<string, unknown>,
    responsiveDimensions?: ResponsiveDimension[],
    generateResponsive?: boolean,
  ): Promise<UploadResponseDto> {
    try {
      const uploadId = metadata?.title
        ? this.sanitizeFileName(metadata.title as string)
        : Date.now().toString();
      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `${uploadId}.${fileExtension}`;

      // Upload original file
      const originalKey = `videos/${fileName}`;
      await this.uploadToR2(originalKey, file.buffer, file.mimetype);

      const cdnUrl = `${this.configService.cdn.baseUrl}/${encodeURIComponent(originalKey)}`;

      // Generate responsive variants if requested
      const responsiveVariants: any[] = [];
      if (generateResponsive && responsiveDimensions) {
        for (const dimension of responsiveDimensions) {
          try {
            const variantFileName = `${uploadId}_${dimension.name}.${fileExtension}`;
            const variantKey = `videos/variants/${variantFileName}`;

            // For simplicity, we'll just copy the original file
            // In production, you might want to resize the video
            await this.uploadToR2(variantKey, file.buffer, file.mimetype);

            const variantUrl = `${this.configService.cdn.baseUrl}/${encodeURIComponent(variantKey)}`;
            responsiveVariants.push({
              name: dimension.name,
              width: dimension.width,
              height: dimension.height,
              url: variantUrl,
              size: file.buffer.length,
              quality: dimension.quality,
            });
          } catch (error) {
            this.logger.warn(
              `Failed to generate video variant ${dimension.name}: ${String(error)}`,
            );
          }
        }
      }

      return {
        upload_id: uploadId,
        user_id: userId,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        file_type: 'video',
        url: cdnUrl,
        responsive_variants:
          responsiveVariants.length > 0 ? responsiveVariants : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Video upload failed: ${String(error)}`);
      throw new BadRequestException('Upload failed');
    }
  }

  async deleteUpload(
    uploadId: string,
    _userId: string,
    fileUrl?: string,
  ): Promise<UploadResponseDto> {
    try {
      if (!fileUrl) {
        throw new BadRequestException('File URL is required for deletion');
      }

      const originalKey = this.extractKeyFromUrl(fileUrl);
      await this.deleteFromR2(originalKey);

      // Delete variants if they exist
      const keyParts = originalKey.split('/');
      const fileName = keyParts[keyParts.length - 1];
      const uploadIdFromKey = fileName.split('.')[0];
      const isImage = originalKey.includes('/images/');
      const isVideo = originalKey.includes('/videos/');

      if (isImage) {
        await this.deleteImageVariants(uploadIdFromKey);
      } else if (isVideo) {
        await this.deleteVideoVariants(uploadIdFromKey);
      }

      this.logger.log(`Successfully deleted file from R2: ${originalKey}`);

      return {
        upload_id: uploadId,
        user_id: _userId,
        file_name: fileName,
        original_name: fileName,
        mime_type: 'application/octet-stream',
        file_size: 0,
        file_type: isImage ? 'image' : 'video',
        url: undefined,
        responsive_variants: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Delete upload failed: ${String(error)}`);
      throw new BadRequestException('Delete failed');
    }
  }

  private async uploadToR2(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await this.s3Client.send(command);
  }

  private async deleteFromR2(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'bin';
  }

  private sanitizeFileName(fileName: string): string {
    // Remove special characters and replace spaces with underscores
    return fileName
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 50); // Limit length to 50 characters
  }

  private extractKeyFromUrl(url: string): string {
    const baseUrl = this.configService.cdn.baseUrl;
    const keyWithEncoding = url.replace(baseUrl + '/', '');
    return decodeURIComponent(keyWithEncoding);
  }

  private async deleteImageVariants(uploadId: string): Promise<void> {
    const variants = ['mobile', 'tablet', 'desktop'];
    for (const variant of variants) {
      try {
        const variantKey = `images/variants/${uploadId}_${variant}.jpg`;
        await this.deleteFromR2(variantKey);
      } catch (error) {
        this.logger.warn(
          `Failed to delete image variant ${variant}: ${String(error)}`,
        );
      }
    }
  }

  private async deleteVideoVariants(uploadId: string): Promise<void> {
    const variants = ['mobile', 'tablet', 'desktop'];
    for (const variant of variants) {
      try {
        const variantKey = `videos/variants/${uploadId}_${variant}.mp4`;
        await this.deleteFromR2(variantKey);
      } catch (error) {
        this.logger.warn(
          `Failed to delete video variant ${variant}: ${String(error)}`,
        );
      }
    }
  }
}
