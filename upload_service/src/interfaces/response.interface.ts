import { ResponsiveVariant } from './responsive.interface';

// Upload response interface
export interface UploadResponse {
  upload_id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_type: 'image' | 'video' | 'document';
  url?: string;
  responsive_variants?: ResponsiveVariant[];
  createdAt: Date;
  updatedAt: Date;
}
