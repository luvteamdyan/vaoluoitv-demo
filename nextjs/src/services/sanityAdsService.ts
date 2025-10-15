import { sanityClient } from '@/lib/sanity';
import { SanityAdvertisement } from '@/types/sanity-ads';

/**
 * Service for managing homepage advertisements from Sanity CMS
 */
export class SanityAdsService {
  /**
   * Get advertisement by position
   * Returns the highest priority active ad for the given position
   * @param position - Ad position identifier
   * @returns Single advertisement or null
   */
  async getAdByPosition(position: string): Promise<SanityAdvertisement | null> {
    try {
      const query = `*[_type == "advertisement" 
        && position == $position 
        && isActive == true
        && (!defined(startDate) || startDate <= now())
        && (!defined(endDate) || endDate >= now())
      ] | order(priority desc)[0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        title,
        position,
        description,
        mediaType,
        mediaImage,
        mediaVideo,
        mediaUrl,
        linkUrl,
        altText,
        isActive,
        priority,
        startDate,
        endDate,
        targetAudience,
        clickCount,
        impressionCount,
        customData
      }`;
      
      const ad = await sanityClient.fetch<SanityAdvertisement>(query, { position });
      return ad || null;
    } catch (error) {
      console.error(`Error fetching ad for position ${position}:`, error);
      return null;
    }
  }

  /**
   * Get multiple advertisements by positions
   * @param positions - Array of position identifiers
   * @returns Object mapping positions to advertisements
   */
  async getAdsByPositions(positions: string[]): Promise<Record<string, SanityAdvertisement>> {
    const ads: Record<string, SanityAdvertisement> = {};
    
    try {
      const results = await Promise.all(
        positions.map(position => this.getAdByPosition(position))
      );
      
      positions.forEach((position, index) => {
        if (results[index]) {
          ads[position] = results[index]!;
        }
      });
    } catch (error) {
      console.error('Error fetching multiple ads:', error);
    }
    
    return ads;
  }


  /**
   * Check if advertisement is currently active and within date range
   * @param ad - Advertisement object
   * @returns boolean indicating if ad should be displayed
   */
  isAdCurrentlyActive(ad: SanityAdvertisement): boolean {
    if (!ad.isActive) return false;

    const now = new Date();
    
    if (ad.startDate && new Date(ad.startDate) > now) {
      return false;
    }
    
    if (ad.endDate && new Date(ad.endDate) < now) {
      return false;
    }
    
    return true;
  }

}

// Export singleton instance
export const sanityAdsService = new SanityAdsService();

// Re-export types for convenience
export type { SanityAdvertisement } from '@/types/sanity-ads';

