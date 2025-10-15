export enum AdsPosition {
  MAIN_ADS = 'main_ads',
  SUB_ADS_1 = 'sub_ads_1',
  SUB_ADS_2 = 'sub_ads_2',
  SUB_ADS_3 = 'sub_ads_3',
  HERO_MAIN = 'hero_main',
  HERO_LEFT = 'hero_left',
  HERO_RIGHT = 'hero_right',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface AdsConfig {
  id: string;
  position: AdsPosition;
  title: string;
  description?: string;
  media_url?: string;
  media_type: MediaType;
  upload_id?: string;
  link_url?: string;
  is_active: boolean;
  click_count: number;
  alt_text?: string;
  target_audience?: string;
  start_date?: Date;
  end_date?: Date;
  priority: number;
  custom_data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdsConfigRequest {
  position: AdsPosition;
  title: string;
  description?: string;
  media_url?: string;
  media_type: MediaType;
  upload_id?: string;
  link_url?: string;
  is_active?: boolean;
  alt_text?: string;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  priority?: number;
  custom_data?: Record<string, unknown>;
}

export interface UpdateAdsConfigRequest {
  title?: string;
  description?: string;
  media_url?: string;
  media_type?: MediaType;
  upload_id?: string;
  link_url?: string;
  is_active?: boolean;
  alt_text?: string;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  priority?: number;
  custom_data?: Record<string, unknown>;
}

export interface AdsConfigListResponse {
  configs: AdsConfig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdsConfigFilters {
  position?: AdsPosition;
  is_active?: boolean;
  media_type?: MediaType;
  search?: string;
}

export const ADS_POSITIONS = [
  { value: AdsPosition.MAIN_ADS, label: 'Main Ads Banner' },
  { value: AdsPosition.SUB_ADS_1, label: 'Sub Ads 1' },
  { value: AdsPosition.SUB_ADS_2, label: 'Sub Ads 2' },
  { value: AdsPosition.SUB_ADS_3, label: 'Sub Ads 3' },
  { value: AdsPosition.HERO_MAIN, label: 'Hero Main Banner' },
  { value: AdsPosition.HERO_LEFT, label: 'Hero Left Banner' },
  { value: AdsPosition.HERO_RIGHT, label: 'Hero Right Banner' },
];

export const MEDIA_TYPES = [
  { value: MediaType.IMAGE, label: 'Image' },
  { value: MediaType.VIDEO, label: 'Video' },
];
