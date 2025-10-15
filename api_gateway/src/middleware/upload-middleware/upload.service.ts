import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Upload, UploadDocument, UploadType } from '@/schemas/upload.schema';
import {
  UploadResponseDto,
  UploadListResponseDto,
  UploadQueryDto,
  UploadStatsDto,
  UploadMetadataDto,
} from './dto/upload.dto';
import { AppConfigService } from '@/config/app-config.service';
import { UploadMicroserviceClient } from './upload-microservice.client';
import {
  UploadImageRequest,
  UploadVideoRequest,
  DeleteUploadRequest,
} from './interfaces/upload-microservice.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>,
    private readonly configService: AppConfigService,
    private readonly microserviceClient: UploadMicroserviceClient,
  ) {}

  /**
   * Upload image via microservice
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    metadata?: UploadMetadataDto,
  ): Promise<UploadResponseDto> {
    try {
      // Prepare microservice request
      const microserviceRequest: UploadImageRequest = {
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
        metadata,
        responsiveDimensions: metadata?.responsiveDimensions,
        generateResponsive: metadata?.generateResponsive,
      };

      // Call microservice
      const result =
        await this.microserviceClient.uploadImage(microserviceRequest);

      // Create database record
      const uploadRecord = new this.uploadModel({
        upload_id: result.upload_id,
        user_id: userId,
        file_name: result.file_name,
        original_name: result.original_name,
        mime_type: result.mime_type,
        file_size: result.file_size,
        file_type: UploadType.IMAGE,
        url: result.url,
        responsive_variants: result.responsive_variants,
      });

      await uploadRecord.save();

      return this.mapToResponseDto(uploadRecord);
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Upload video via microservice
   */
  async uploadVideo(
    file: Express.Multer.File,
    userId: string,
    metadata?: UploadMetadataDto,
  ): Promise<UploadResponseDto> {
    try {
      // Prepare microservice request
      const microserviceRequest: UploadVideoRequest = {
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
        metadata,
        responsiveDimensions: metadata?.responsiveDimensions,
        generateResponsive: metadata?.generateResponsive,
      };

      // Call microservice
      const result =
        await this.microserviceClient.uploadVideo(microserviceRequest);

      // Create database record
      const uploadRecord = new this.uploadModel({
        upload_id: result.upload_id,
        user_id: userId,
        file_name: result.file_name,
        original_name: result.original_name,
        mime_type: result.mime_type,
        file_size: result.file_size,
        file_type: UploadType.VIDEO,
        url: result.url,
        responsive_variants: result.responsive_variants,
      });

      await uploadRecord.save();

      return this.mapToResponseDto(uploadRecord);
    } catch (error) {
      this.logger.error('Error uploading video:', error);
      throw new InternalServerErrorException('Failed to upload video');
    }
  }

  /**
   * Delete upload via microservice
   */
  async deleteUpload(uploadId: string, userId: string | null): Promise<void> {
    try {
      const filter: any = { upload_id: uploadId };

      // Only filter by user_id if userId is not 'admin'
      if (userId && userId !== 'admin') {
        filter.user_id = userId;
      }

      const uploadRecord = await this.uploadModel.findOne(filter);
      if (!uploadRecord) {
        throw new NotFoundException('Upload not found');
      }

      // Check if file has URL for R2 deletion
      if (!uploadRecord.url) {
        throw new BadRequestException(
          'File URL not found, cannot delete from R2',
        );
      }

      // Prepare microservice request with file URL
      const microserviceRequest: DeleteUploadRequest = {
        uploadId,
        userId: userId || 'admin',
        fileUrl: uploadRecord.url,
      };

      // Call microservice to delete from R2
      await this.microserviceClient.deleteUpload(microserviceRequest);

      // Delete from database
      await this.uploadModel.deleteOne({ upload_id: uploadId });

      this.logger.log(
        `Successfully deleted upload ${uploadId} from both R2 and database`,
      );
    } catch (error) {
      this.logger.error('Error deleting upload:', error);
      throw new InternalServerErrorException('Failed to delete upload');
    }
  }

  /**
   * Get all uploads for a user with pagination and filtering
   */
  async findAll(
    query: UploadQueryDto,
    userId: string | null,
  ): Promise<UploadListResponseDto> {
    try {
      const { page = 1, limit = 10, file_type, search } = query;
      const skip = (page - 1) * limit;

      const filter: any = {};

      // Only filter by user_id if userId is not 'admin'
      if (userId && userId !== 'admin') {
        filter.user_id = userId;
      }

      if (file_type) filter.file_type = file_type;
      if (search) {
        filter.$or = [
          { original_name: { $regex: search, $options: 'i' } },
          { file_name: { $regex: search, $options: 'i' } },
        ];
      }

      const [uploads, total] = await Promise.all([
        this.uploadModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.uploadModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        uploads: uploads.map((upload) => this.mapToResponseDto(upload)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error('Error getting uploads:', error);
      throw new InternalServerErrorException('Failed to get uploads');
    }
  }

  /**
   * Get upload by ID
   */
  async findOne(uploadId: string, userId: string): Promise<UploadResponseDto> {
    try {
      const uploadRecord = await this.uploadModel.findOne({
        upload_id: uploadId,
        user_id: userId,
      });
      if (!uploadRecord) {
        throw new NotFoundException('Upload not found');
      }

      return this.mapToResponseDto(uploadRecord);
    } catch (error) {
      this.logger.error('Error getting upload:', error);
      throw new InternalServerErrorException('Failed to get upload');
    }
  }

  /**
   * Get upload statistics for a user
   */
  async getUploadStats(userId: string | null): Promise<UploadStatsDto> {
    try {
      const filter: any = {};

      // Only filter by user_id if userId is not 'admin'
      if (userId && userId !== 'admin') {
        filter.user_id = userId;
      }

      const [totalUploads, totalSizeResult, uploadsByType, recentUploads] =
        await Promise.all([
          this.uploadModel.countDocuments(filter),
          this.uploadModel.aggregate([
            { $match: filter },
            { $group: { _id: null, totalSize: { $sum: '$file_size' } } },
          ]),
          this.uploadModel.aggregate([
            { $match: filter },
            { $group: { _id: '$file_type', count: { $sum: 1 } } },
          ]),
          this.uploadModel.find(filter).sort({ createdAt: -1 }).limit(5).exec(),
        ]);

      const totalSize = totalSizeResult[0]?.totalSize || 0;
      const uploadsByTypeMap = uploadsByType.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<UploadType, number>,
      );

      return {
        total_uploads: totalUploads,
        total_size: totalSize,
        uploads_by_type: uploadsByTypeMap,
        recent_uploads: recentUploads.map((upload) =>
          this.mapToResponseDto(upload),
        ),
      };
    } catch (error) {
      this.logger.error('Error getting upload stats:', error);
      throw new InternalServerErrorException('Failed to get upload stats');
    }
  }

  /**
   * Map upload document to response DTO
   */
  private mapToResponseDto(upload: UploadDocument): UploadResponseDto {
    return {
      upload_id: upload.upload_id,
      user_id: upload.user_id?.toString() || '',
      file_name: upload.file_name,
      original_name: upload.original_name,
      mime_type: upload.mime_type,
      file_size: upload.file_size,
      file_type: upload.file_type,
      url: upload.url,
      responsive_variants: upload.responsive_variants,
      createdAt: upload.toObject().createdAt,
      updatedAt: upload.toObject().updatedAt,
    };
  }
}
