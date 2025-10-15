// import { SanityOffer } from '@/types/sanity-offers';

/**
 * Get optimized image URL from Sanity asset reference
 */
import { urlFor } from '@/lib/sanity';

export const getOfferImageUrl = (imageRef?: { asset: { _ref: string } }): string | null => {
  if (!imageRef?.asset?._ref) return null;
  
  // Use Sanity image URL builder for optimization - higher quality for offers
  return urlFor(imageRef)
    .width(600)
    .auto('format')
    .quality(85)
    .url();
};


