/**
 * Sanity Ads Position Enum
 * Matches the position values defined in Sanity schema
 */
export enum SanityAdsPosition {
  MAIN_ADS = 'main_ads',
  SUB_ADS_1 = 'sub_ads_1',
  SUB_ADS_2 = 'sub_ads_2',
  SUB_ADS_3 = 'sub_ads_3',
  HERO_MAIN = 'hero_main',
  HERO_LEFT = 'hero_left',
  HERO_RIGHT = 'hero_right',
  MATCH_SCHEDULE = 'match_schedule',
  CATFISH_BANNER = 'catfish_banner',
}

/**
 * Sanity Media Type Enum
 */
export enum SanityMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

/**
 * Sanity Image Asset
 */
export interface SanityImageAsset {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

/**
 * Sanity File Asset
 */
export interface SanityFileAsset {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

/**
 * Custom Data for Advertisement
 */
export interface AdCustomData {
  campaignId?: string;
  advertiser?: string;
  budget?: number;
  notes?: string;
}

/**
 * Sanity Advertisement Document
 */
export interface SanityAdvertisement {
  _id: string;
  _type: 'advertisement';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  position: SanityAdsPosition;
  description?: string;
  mediaType: SanityMediaType;
  mediaImage?: SanityImageAsset;
  mediaVideo?: SanityFileAsset;
  mediaUrl?: string;
  linkUrl?: string;
  altText?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  clickCount?: number;
  impressionCount?: number;
  customData?: AdCustomData;
}

/**
 * Ads Position Information
 */
export interface AdsPositionInfo {
  position: SanityAdsPosition;
  name: string;
  description?: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio?: string;
  };
}


/**
 * Recommended dimensions for each ad position
 */
export const ADS_DIMENSIONS: Record<SanityAdsPosition, { width: number; height: number; aspectRatio: string }> = {
  [SanityAdsPosition.MAIN_ADS]: {
    width: 1280,
    height: 100,
    aspectRatio: '1280/100',
  },
  [SanityAdsPosition.SUB_ADS_1]: {
    width: 640,
    height: 100,
    aspectRatio: '640/100',
  },
  [SanityAdsPosition.SUB_ADS_2]: {
    width: 640,
    height: 100,
    aspectRatio: '640/100',
  },
  [SanityAdsPosition.SUB_ADS_3]: {
    width: 640,
    height: 100,
    aspectRatio: '640/100',
  },
  [SanityAdsPosition.HERO_MAIN]: {
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
  },
  [SanityAdsPosition.HERO_LEFT]: {
    width: 640,
    height: 800,
    aspectRatio: '4/5',
  },
  [SanityAdsPosition.HERO_RIGHT]: {
    width: 640,
    height: 800,
    aspectRatio: '4/5',
  },
  [SanityAdsPosition.MATCH_SCHEDULE]: {
    width: 1280,
    height: 100,
    aspectRatio: '1280/100',
  },
  [SanityAdsPosition.CATFISH_BANNER]: {
    width: 1280,
    height: 100,
    aspectRatio: '1280/100',
  },
};

/**
 * Ad display configuration
 */
export interface AdDisplayConfig {
  ad: SanityAdvertisement;
  dimensions: { width: number; height: number; aspectRatio: string };
  mediaUrl: string;
  isValid: boolean;
}

