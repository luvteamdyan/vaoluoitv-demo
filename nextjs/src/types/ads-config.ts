export enum AdsPosition {
  MAIN_ADS = 'main_ads',
  SUB_ADS_1 = 'sub_ads_1',
  SUB_ADS_2 = 'sub_ads_2',
  SUB_ADS_3 = 'sub_ads_3',
  HERO_MAIN = 'hero_main',
  HERO_LEFT = 'hero_left',
  HERO_RIGHT = 'hero_right',
  MATCH_SCHEDULE = 'match_schedule',
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
