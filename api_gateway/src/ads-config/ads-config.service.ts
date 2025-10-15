import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdsConfig, AdsConfigDocument } from '@/schemas/ads-config.schema';
import {
  CreateAdsConfigDto,
  UpdateAdsConfigDto,
  AdsConfigResponseDto,
  AdsConfigListResponseDto,
  AdsConfigQueryDto,
  AdsPosition,
} from './dto/ads-config.dto';

@Injectable()
export class AdsConfigService {
  private readonly logger = new Logger(AdsConfigService.name);

  constructor(
    @InjectModel(AdsConfig.name)
    private adsConfigModel: Model<AdsConfigDocument>,
  ) {}

  async create(createDto: CreateAdsConfigDto): Promise<AdsConfigResponseDto> {
    try {
      // Check if position already exists
      const existingConfig = await this.adsConfigModel.findOne({
        position: createDto.position,
      });

      if (existingConfig) {
        throw new ConflictException(
          `Ads config for position ${createDto.position} already exists`,
        );
      }

      const adsConfig = new this.adsConfigModel({
        id: this.generateId(),
        ...createDto,
        click_count: 0,
      });

      const savedConfig = await adsConfig.save();
      return this.toResponseDto(savedConfig);
    } catch (error) {
      this.logger.error('Error creating ads config:', error);
      throw error;
    }
  }

  async findAll(query: AdsConfigQueryDto): Promise<AdsConfigListResponseDto> {
    try {
      const filter: any = {};

      if (query.position) {
        filter.position = query.position;
      }

      if (query.is_active !== undefined) {
        filter.is_active = query.is_active;
      }

      if (query.media_type) {
        filter.media_type = query.media_type;
      }

      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
        ];
      }

      const configs = await this.adsConfigModel
        .find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .exec();

      return {
        configs: configs.map((config) => this.toResponseDto(config)),
        total: configs.length,
        page: 1,
        limit: configs.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    } catch (error) {
      this.logger.error('Error finding ads configs:', error);
      throw error;
    }
  }

  async findByPosition(
    position: AdsPosition,
  ): Promise<AdsConfigResponseDto | null> {
    try {
      const config = await this.adsConfigModel.findOne({ position }).exec();
      return config ? this.toResponseDto(config) : null;
    } catch (error) {
      this.logger.error('Error finding ads config by position:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AdsConfigResponseDto> {
    try {
      const config = await this.adsConfigModel.findOne({ id }).exec();
      if (!config) {
        throw new NotFoundException(`Ads config with ID ${id} not found`);
      }
      return this.toResponseDto(config);
    } catch (error) {
      this.logger.error('Error finding ads config:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateDto: UpdateAdsConfigDto,
  ): Promise<AdsConfigResponseDto> {
    try {
      const config = await this.adsConfigModel
        .findOneAndUpdate({ id }, { ...updateDto }, { new: true })
        .exec();

      if (!config) {
        throw new NotFoundException(`Ads config with ID ${id} not found`);
      }

      return this.toResponseDto(config);
    } catch (error) {
      this.logger.error('Error updating ads config:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.adsConfigModel.deleteOne({ id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Ads config with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error('Error removing ads config:', error);
      throw error;
    }
  }

  async incrementClickCount(id: string): Promise<void> {
    try {
      await this.adsConfigModel
        .updateOne({ id }, { $inc: { click_count: 1 } })
        .exec();
    } catch (error) {
      this.logger.error('Error incrementing click count:', error);
      throw error;
    }
  }

  async getActiveAds(): Promise<AdsConfigResponseDto[]> {
    try {
      const now = new Date();
      const configs = await this.adsConfigModel
        .find({
          is_active: true,
          $and: [
            {
              $or: [
                { start_date: { $exists: false } },
                { start_date: { $lte: now } },
              ],
            },
            {
              $or: [
                { end_date: { $exists: false } },
                { end_date: { $gte: now } },
              ],
            },
          ],
        })
        .sort({ priority: -1, createdAt: -1 })
        .exec();

      return configs.map((config) => this.toResponseDto(config));
    } catch (error) {
      this.logger.error('Error getting active ads:', error);
      throw error;
    }
  }

  private toResponseDto(config: AdsConfigDocument): AdsConfigResponseDto {
    return {
      id: config.id,
      position: config.position as AdsPosition,
      title: config.title,
      description: config.description,
      media_url: config.media_url,
      media_type: config.media_type as any,
      upload_id: config.upload_id,
      link_url: config.link_url,
      is_active: config.is_active,
      click_count: config.click_count,
      alt_text: config.alt_text,
      target_audience: config.target_audience,
      start_date: config.start_date,
      end_date: config.end_date,
      priority: config.priority,
      custom_data: config.custom_data,
      createdAt: config.createdAt || new Date(),
      updatedAt: config.updatedAt || new Date(),
    };
  }

  private generateId(): string {
    return `ads_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
