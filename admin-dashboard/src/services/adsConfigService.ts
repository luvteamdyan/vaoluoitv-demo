import { AdsConfig, AdsConfigListResponse, AdsConfigFilters, CreateAdsConfigRequest, UpdateAdsConfigRequest, AdsPosition } from '@/types/ads-config';
import { getCookie } from '@/utils/cookies';

class AdsConfigService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_ADS_CONFIG_URL || 'http://localhost:3000/api/v1';
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

  // Create new ads config
  async create(config: CreateAdsConfigRequest): Promise<AdsConfig> {
    // Remove undefined values before sending
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([, value]) => value !== undefined)
    );
    
    return this.request<AdsConfig>('/ads-config', {
      method: 'POST',
      body: JSON.stringify(cleanConfig),
    });
  }

  // Get all ads configs
  async getAllConfigs(filters: AdsConfigFilters = {}): Promise<AdsConfigListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/ads-config?${queryString}` : '/ads-config';
    
    return this.request<AdsConfigListResponse>(endpoint);
  }

  // Get active ads configs (public endpoint)
  async getActiveAds(): Promise<AdsConfig[]> {
    return this.request<AdsConfig[]>('/ads-config/active');
  }

  // Get ads config by position (public endpoint)
  async getByPosition(position: AdsPosition): Promise<AdsConfig | null> {
    try {
      return await this.request<AdsConfig>(`/ads-config/position/${position}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Get ads config by ID
  async getById(id: string): Promise<AdsConfig> {
    return this.request<AdsConfig>(`/ads-config/${id}`);
  }

  // Update ads config
  async update(id: string, config: UpdateAdsConfigRequest): Promise<AdsConfig> {
    // Remove undefined values before sending
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([, value]) => value !== undefined)
    );
    
    return this.request<AdsConfig>(`/ads-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanConfig),
    });
  }

  // Delete ads config
  async delete(id: string): Promise<void> {
    return this.request<void>(`/ads-config/${id}`, {
      method: 'DELETE',
    });
  }

  // Track ad click
  async trackClick(id: string): Promise<void> {
    return this.request<void>(`/ads-config/${id}/click`, {
      method: 'POST',
    });
  }

  // Get position label
  getPositionLabel(position: AdsPosition): string {
    const positionMap: Record<AdsPosition, string> = {
      [AdsPosition.MAIN_ADS]: 'Main Ads Banner',
      [AdsPosition.SUB_ADS_1]: 'Sub Ads 1',
      [AdsPosition.SUB_ADS_2]: 'Sub Ads 2',
      [AdsPosition.SUB_ADS_3]: 'Sub Ads 3',
      [AdsPosition.HERO_LEFT]: 'Hero Left Banner',
      [AdsPosition.HERO_RIGHT]: 'Hero Right Banner',
      [AdsPosition.HERO_MAIN]: 'Hero Main Banner',
    };
    return positionMap[position] || position;
  }

  // Format date
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Format click count
  formatClickCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

export const adsConfigService = new AdsConfigService();
