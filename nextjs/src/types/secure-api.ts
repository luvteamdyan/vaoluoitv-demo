// Types for Secure API integration

export interface UrlSignRequest {
  streamId: string;
  userId?: string;
  format?: string;
  ttl?: number;
}

export interface UrlSignResponse {
  url: string;
  wsSecret: string;
  wsTime: number;
  expiresAt: string;
}

export interface UrlValidateRequest {
  path: string;
  wsSecret: string;
  wsTime: number;
}

export interface UrlValidateResponse {
  valid: boolean;
  streamId?: string;
  userId?: string;
  message?: string;
}

export interface StreamInfoResponse {
  streamId: string;
  title: string;
  status: string;
  signedUrl?: string;
  expiresAt?: string;
}

export interface MultipleUrlsRequest {
  formats?: string[];
  ttl?: number;
}

export interface SecureApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface StreamAccessInfo {
  hasAccess: boolean;
  signedUrl?: string;
  expiresAt?: string;
  message?: string;
  requiresAuth?: boolean;
}
