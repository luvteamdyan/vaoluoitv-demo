import { ResponsiveVariantDto } from './responsive.dto';

export class UploadResponseDto {
  upload_id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_type: 'image' | 'video' | 'document';
  url?: string;
  responsive_variants?: ResponsiveVariantDto[];
  createdAt: Date;
  updatedAt: Date;
}
