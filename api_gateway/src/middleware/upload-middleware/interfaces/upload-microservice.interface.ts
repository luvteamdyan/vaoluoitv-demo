// Re-export all interfaces from separate files for backward compatibility
export { UPLOAD_MICROSERVICE_PATTERNS } from './patterns';
export type {
  ResponsiveDimension,
  ResponsiveVariant,
} from './responsive.interface';
export type {
  UploadImageRequest,
  UploadVideoRequest,
  DeleteUploadRequest,
} from './request.interface';
export type { UploadResponse } from './response.interface';
