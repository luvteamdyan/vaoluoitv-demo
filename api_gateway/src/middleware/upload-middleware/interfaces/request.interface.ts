import { ResponsiveDimension } from './responsive.interface';

// Upload image request interface
export interface UploadImageRequest {
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  userId: string;
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    custom_data?: Record<string, any>;
  };
  responsiveDimensions?: ResponsiveDimension[];
  generateResponsive?: boolean;
}

// Upload video request interface
export interface UploadVideoRequest {
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  userId: string;
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    custom_data?: Record<string, any>;
  };
  responsiveDimensions?: ResponsiveDimension[];
  generateResponsive?: boolean;
}

// Delete upload request interface
export interface DeleteUploadRequest {
  uploadId: string;
  userId: string;
  fileUrl: string;
}
