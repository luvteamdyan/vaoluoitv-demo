export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum UploadType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export interface UploadMetadata {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  alt_text?: string;
  usage_context?: string[];
  dimensions?: { width: number; height: number };
  file_hash?: string;
  is_active?: boolean;
  expires_at?: Date;
  custom_data?: Record<string, unknown>;
}

export interface Upload {
  upload_id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_type: UploadType;
  status: UploadStatus;
  progress: number;
  url?: string;
  duration?: number;
  error_message?: string;
  metadata?: UploadMetadata;
  completed_at?: string;
  deleted_at?: string;
  cdn_info?: {
    provider: string;
    bucket: string;
    key: string;
    region?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  upload_id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_type: UploadType;
  status: UploadStatus;
  progress: number;
  url?: string;
  duration?: number;
  error_message?: string;
  metadata?: UploadMetadata;
  completed_at?: string;
  deleted_at?: string;
  cdn_info?: {
    provider: string;
    bucket: string;
    key: string;
    region?: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface UploadListResponse {
  uploads: Upload[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UploadFilters {
  page?: number;
  limit?: number;
  file_type?: UploadType;
  search?: string;
}
export interface UploadStats {
  total_uploads: number;
  total_size: number;
  uploads_by_type: Record<UploadType, number>;
  recent_uploads: Upload[];
}

export interface CreateUploadRequest {
  file: File;
  metadata?: UploadMetadata;
}

export interface UpdateUploadRequest {
  metadata?: UploadMetadata;
}

