import { urlFor, getVideoUrl } from '@/lib/sanity';
import { 
  SanityAdvertisement, 
  SanityAdsPosition, 
  ADS_DIMENSIONS,
  AdDisplayConfig 
} from '@/types/sanity-ads';

/**
 * Get media URL from Sanity advertisement
 * Handles both image and video types, with CDN URL fallback
 */
export function getAdMediaUrl(ad: SanityAdvertisement): string | null {
  // Priority 1: Direct CDN URL
  if (ad.mediaUrl) {
    return ad.mediaUrl;
  }

  // Priority 2: Sanity image (optimized)
  if (ad.mediaType === 'image' && ad.mediaImage) {
    return urlFor(ad.mediaImage)
      .auto('format')
      .quality(85)
      .url();
  }

  // Priority 3: Sanity video file
  if (ad.mediaType === 'video' && ad.mediaVideo) {
    return getVideoUrl(ad.mediaVideo);
  }

  return null;
}

/**
 * Get optimized media URL with specific dimensions
 */
export function getOptimizedAdMediaUrl(
  ad: SanityAdvertisement,
  width?: number,
  height?: number
): string | null {
  // Use direct URL for videos or if CDN URL is provided
  if (ad.mediaUrl || ad.mediaType === 'video') {
    return getAdMediaUrl(ad);
  }

  // Optimize image if dimensions provided
  if (ad.mediaImage && width) {
    const imageBuilder = urlFor(ad.mediaImage)
      .width(width)
      .auto('format')
      .quality(85);

    if (height) {
      return imageBuilder.height(height).url();
    }

    return imageBuilder.url();
  }

  return getAdMediaUrl(ad);
}

/**
 * Get responsive media URLs for different breakpoints
 */
export function getResponsiveAdMediaUrls(ad: SanityAdvertisement) {
  const dimensions = ADS_DIMENSIONS[ad.position as SanityAdsPosition];
  
  return {
    mobile: getOptimizedAdMediaUrl(ad, Math.floor(dimensions.width * 0.5)),
    tablet: getOptimizedAdMediaUrl(ad, Math.floor(dimensions.width * 0.75)),
    desktop: getOptimizedAdMediaUrl(ad, dimensions.width),
    original: getAdMediaUrl(ad),
  };
}

/**
 * Check if ad is within valid date range
 */
export function isAdWithinDateRange(ad: SanityAdvertisement): boolean {
  const now = new Date();

  if (ad.startDate && new Date(ad.startDate) > now) {
    return false;
  }

  if (ad.endDate && new Date(ad.endDate) < now) {
    return false;
  }

  return true;
}

/**
 * Check if ad should be displayed
 */
export function shouldDisplayAd(ad: SanityAdvertisement): boolean {
  return ad.isActive && isAdWithinDateRange(ad);
}

/**
 * Get ad display configuration with all necessary data
 */
export function getAdDisplayConfig(ad: SanityAdvertisement): AdDisplayConfig | null {
  const mediaUrl = getAdMediaUrl(ad);
  const dimensions = ADS_DIMENSIONS[ad.position as SanityAdsPosition];
  const isValid = shouldDisplayAd(ad) && mediaUrl !== null;

  if (!isValid || !mediaUrl) {
    return null;
  }

  return {
    ad,
    dimensions,
    mediaUrl,
    isValid,
  };
}

/**
 * Calculate ad CTR (Click-Through Rate)
 */
export function calculateAdCTR(ad: SanityAdvertisement): number {
  if (!ad.impressionCount || ad.impressionCount === 0) {
    return 0;
  }

  const clicks = ad.clickCount || 0;
  return (clicks / ad.impressionCount) * 100;
}

/**
 * Format ad performance metrics
 */
export function formatAdMetrics(ad: SanityAdvertisement) {
  return {
    clicks: ad.clickCount || 0,
    impressions: ad.impressionCount || 0,
    ctr: calculateAdCTR(ad).toFixed(2) + '%',
    priority: ad.priority,
  };
}

/**
 * Get ad status text
 */
export function getAdStatusText(ad: SanityAdvertisement): string {
  if (!ad.isActive) {
    return 'Không hoạt động';
  }

  if (ad.startDate && new Date(ad.startDate) > new Date()) {
    return 'Đã lên lịch';
  }

  if (ad.endDate && new Date(ad.endDate) < new Date()) {
    return 'Đã hết hạn';
  }

  return 'Đang hoạt động';
}

/**
 * Get ad status color for UI
 */
export function getAdStatusColor(ad: SanityAdvertisement): string {
  const status = getAdStatusText(ad);

  switch (status) {
    case 'Đang hoạt động':
      return 'green';
    case 'Đã lên lịch':
      return 'blue';
    case 'Đã hết hạn':
      return 'orange';
    case 'Không hoạt động':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Sort ads by priority (descending)
 */
export function sortAdsByPriority(ads: SanityAdvertisement[]): SanityAdvertisement[] {
  return [...ads].sort((a, b) => b.priority - a.priority);
}

/**
 * Filter active ads only
 */
export function filterActiveAds(ads: SanityAdvertisement[]): SanityAdvertisement[] {
  return ads.filter(shouldDisplayAd);
}

/**
 * Group ads by position
 */
export function groupAdsByPosition(
  ads: SanityAdvertisement[]
): Record<SanityAdsPosition, SanityAdvertisement[]> {
  const grouped = {} as Record<SanityAdsPosition, SanityAdvertisement[]>;

  ads.forEach((ad) => {
    const position = ad.position as SanityAdsPosition;
    if (!grouped[position]) {
      grouped[position] = [];
    }
    grouped[position].push(ad);
  });

  return grouped;
}

/**
 * Get the highest priority ad for a position
 */
export function getTopAdForPosition(
  ads: SanityAdvertisement[],
  position: SanityAdsPosition
): SanityAdvertisement | null {
  const positionAds = ads
    .filter((ad) => ad.position === position)
    .filter(shouldDisplayAd);

  if (positionAds.length === 0) {
    return null;
  }

  return sortAdsByPriority(positionAds)[0];
}

/**
 * Format date for display
 */
export function formatAdDate(dateString?: string): string {
  if (!dateString) {
    return 'Không giới hạn';
  }

  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get remaining days until ad expires
 */
export function getRemainingDays(ad: SanityAdvertisement): number | null {
  if (!ad.endDate) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(ad.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if ad is expiring soon (within 7 days)
 */
export function isAdExpiringSoon(ad: SanityAdvertisement): boolean {
  const remainingDays = getRemainingDays(ad);
  return remainingDays !== null && remainingDays > 0 && remainingDays <= 7;
}

/**
 * Validate ad media URL
 */
export function isValidMediaUrl(url: string | null): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get ad link with tracking parameters
 */
export function getAdLinkWithTracking(
  ad: SanityAdvertisement,
  utmSource?: string,
  utmMedium?: string
): string {
  const baseUrl = ad.linkUrl || '/';
  
  if (!utmSource && !utmMedium) {
    return baseUrl;
  }

  const url = new URL(baseUrl, window.location.origin);
  
  if (utmSource) {
    url.searchParams.set('utm_source', utmSource);
  }
  
  if (utmMedium) {
    url.searchParams.set('utm_medium', utmMedium);
  }

  if (ad.customData?.campaignId) {
    url.searchParams.set('utm_campaign', ad.customData.campaignId);
  }

  return url.toString();
}

