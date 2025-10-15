import { 
  UrlSignRequest, 
  UrlSignResponse, 
  UrlValidateRequest, 
  UrlValidateResponse,
  StreamInfoResponse,
  MultipleUrlsRequest,
  SecureApiResponse,
  StreamAccessInfo
} from '@/types/secure-api';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class SecureApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { 
        ...defaultOptions, 
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors, timeouts, and other connection issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`API connection failed for ${endpoint}:`, error.message);
        throw new Error('CONNECTION_REFUSED');
      }
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    if (!token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Sign URL for FLV stream access
   */
  async signUrl(request: UrlSignRequest): Promise<UrlSignResponse> {
    const response = await this.makeRequest<SecureApiResponse<UrlSignResponse>>(
      '/security/sign',
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          ...this.getAuthHeaders(),
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to sign URL');
    }

    return response.data;
  }

  /**
   * Validate URL signature
   */
  async validateUrl(request: UrlValidateRequest): Promise<UrlValidateResponse> {
    const response = await this.makeRequest<SecureApiResponse<UrlValidateResponse>>(
      '/security/validate',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to validate URL');
    }

    return response.data;
  }

  /**
   * Get stream info with signed URL
   */
  async getStreamInfo(streamId: string): Promise<StreamInfoResponse> {
    const response = await this.makeRequest<SecureApiResponse<StreamInfoResponse>>(
      `/security/stream/${streamId}`,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get stream info');
    }

    return response.data;
  }

  /**
   * Generate multiple signed URLs for different formats
   */
  async generateMultipleUrls(
    streamId: string,
    request: MultipleUrlsRequest
  ): Promise<Record<string, UrlSignResponse>> {
    const response = await this.makeRequest<SecureApiResponse<Record<string, UrlSignResponse>>>(
      `/security/cdn/1/urls`,
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          ...this.getAuthHeaders(),
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to generate multiple URLs');
    }

    return response.data;
  }

  /**
   * Health check for secure API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    const response = await this.makeRequest<SecureApiResponse<{ status: string; timestamp: string; service: string }>>(
      '/security/health'
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Secure API is not available');
    }

    return response.data;
  }

  /**
   * Get stream access info for a match
   * This method handles different authentication states and returns appropriate access info
   */
  async getStreamAccess(matchId: string): Promise<StreamAccessInfo> {
    try {
      // First, try to get stream info (this will work for authenticated users)
      const streamInfo = await this.getStreamInfo(matchId);
      
      if (streamInfo.signedUrl) {
        return {
          hasAccess: true,
          signedUrl: streamInfo.signedUrl,
          expiresAt: streamInfo.expiresAt,
          message: 'Stream access granted',
        };
      } else {
        return {
          hasAccess: false,
          message: 'Stream is not currently available',
        };
      }
    } catch (error: unknown) {
      // If user is not authenticated, they might still be able to access some streams
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
          hasAccess: false,
          requiresAuth: true,
          message: 'Authentication required to access this stream',
        };
      }
      
      // For other errors, return generic message
      return {
        hasAccess: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get stream access for unauthenticated users (if allowed)
   * This method tries to get stream info without authentication
   */
  async getPublicStreamAccess(matchId: string): Promise<StreamAccessInfo> {
    try {
      // Try to get stream info without authentication
      const response = await fetch(`${API_BASE_URL}/security/stream/${matchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.signedUrl) {
          return {
            hasAccess: true,
            signedUrl: data.data.signedUrl,
            expiresAt: data.data.expiresAt,
            message: 'Public stream access granted',
          };
        }
      }

      return {
        hasAccess: false,
        message: 'Stream is not available for public access',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to access stream';
      return {
        hasAccess: false,
        message: errorMessage,
      };
    }
  }
}

export const secureApiService = new SecureApiService();
export default secureApiService;
