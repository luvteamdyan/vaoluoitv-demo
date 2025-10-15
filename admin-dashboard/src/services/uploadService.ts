import { Upload, UploadResponse, UploadFilters, UploadStats, UploadListResponse, UploadMetadata } from '@/types/upload';
import { getCookie } from '@/utils/cookies';

class UploadService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:3000/api/v1';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getCookie('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async uploadFile(
    endpoint: string,
    file: File,
    metadata?: UploadMetadata
  ): Promise<UploadResponse> {
    const token = getCookie('access_token');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Gửi metadata như các field riêng biệt trong FormData
    if (metadata) {
      if (metadata.title) {
        formData.append('title', metadata.title);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.category) {
        formData.append('category', metadata.category);
      }
      if (metadata.subcategory) {
        formData.append('subcategory', metadata.subcategory);
      }
      if (metadata.tags && metadata.tags.length > 0) {
        // Gửi tags như một string phân cách bằng dấu phẩy
        formData.append('tags', metadata.tags.join(','));
      }
      if (metadata.alt_text) {
        formData.append('alt_text', metadata.alt_text);
      }
      if (metadata.usage_context && metadata.usage_context.length > 0) {
        formData.append('usage_context', metadata.usage_context.join(','));
      }
      if (metadata.is_active !== undefined) {
        formData.append('is_active', metadata.is_active.toString());
      }
      if (metadata.expires_at) {
        formData.append('expires_at', metadata.expires_at.toISOString());
      }
      if (metadata.custom_data) {
        formData.append('custom_data', JSON.stringify(metadata.custom_data));
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Upload image
  async uploadImage(file: File, metadata?: UploadMetadata): Promise<UploadResponse> {
    return this.uploadFile('/uploads/image', file, metadata);
  }

  // Upload video
  async uploadVideo(file: File, metadata?: UploadMetadata): Promise<UploadResponse> {
    return this.uploadFile('/uploads/video', file, metadata);
  }


  // Delete upload
  async deleteUpload(id: string): Promise<void> {
    return this.request<void>(`/uploads/${id}`, {
      method: 'DELETE',
    });
  }

  // Get all uploads (admin endpoint)
  async getAllUploads(filters: UploadFilters = {}): Promise<UploadListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/uploads/admin/all?${queryString}` : '/uploads/admin/all';
    
    return this.request<UploadListResponse>(endpoint);
  }

  // Get upload by ID
  async getUploadById(id: string): Promise<Upload> {
    return this.request<Upload>(`/uploads/${id}`);
  }

  // Get upload stats (admin endpoint)
  async getUploadStats(): Promise<UploadStats> {
    return this.request<UploadStats>('/uploads/admin/stats');
  }

  // Search uploads
  async searchUploads(query: string): Promise<Upload[]> {
    return this.request<Upload[]>(`/uploads/search?q=${encodeURIComponent(query)}`);
  }

  // Get uploads by status
  async getUploadsByStatus(status: string): Promise<Upload[]> {
    return this.request<Upload[]>(`/uploads/status/${status}`);
  }

  // Get uploads by user
  async getUploadsByUser(userId: string): Promise<Upload[]> {
    return this.request<Upload[]>(`/uploads/user/${userId}`);
  }

  // Update upload metadata
  async updateUploadMetadata(id: string, metadata: UploadMetadata): Promise<Upload> {
    return this.request<Upload>(`/uploads/${id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    });
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format duration
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Get file type from mime type
  getFileType(mimeType?: string): 'image' | 'video' | 'other' {
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  }

  // Validate file type
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  isValidFileSize(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }
}

export const uploadService = new UploadService();
