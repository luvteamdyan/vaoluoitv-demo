import { IsOptional, IsString, IsObject } from 'class-validator';

export class UploadMetadataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;
}
