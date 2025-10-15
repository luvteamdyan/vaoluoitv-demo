import { AdsConfig, AdsPosition } from '../types/ads-config';

class AdsConfigService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        // For 404 or other client errors, return null instead of throwing
        if (response.status === 404) {
          return null as T;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null as T;
      }
      
      const text = await response.text();
      if (!text.trim()) {
        return null as T;
      }
      
      return JSON.parse(text);
    } catch (error) {
      // Handle network errors, timeouts, and other connection issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`API connection failed for ${endpoint}:`, error.message);
        throw new Error('CONNECTION_REFUSED');
      }
      // Handle JSON parsing errors gracefully
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return null as T;
      }
      throw error;
    }
  }

  // Get active ads configs
  async getActiveAds(): Promise<AdsConfig[]> {
    return this.request<AdsConfig[]>('/ads-config/active');
  }

  // Get ads config by position
  async getByPosition(position: AdsPosition): Promise<AdsConfig | null> {
    try {
      return await this.request<AdsConfig>(`/ads-config/position/${position}`);
    } catch (error) {
      // Handle connection refused errors gracefully
      if (error instanceof Error && error.message === 'CONNECTION_REFUSED') {
        console.warn(`API server not available for position ${position}, using fallback`);
        return null;
      }
      // For other errors (like JSON parsing), silently return null to use fallback
      return null;
    }
  }

  // Track ad click
  async trackClick(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/ads-config/${id}/click`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000), // 3 second timeout for tracking
      });
    } catch (error) {
      // Silently fail for tracking - don't show errors to user
      console.warn('Error tracking click (API may be unavailable):', error);
    }
  }
}

export const adsConfigService = new AdsConfigService();
