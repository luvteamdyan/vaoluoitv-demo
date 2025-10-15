import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Sanity client configuration
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3mt74yqx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // Set to false if you want to ensure fresh data
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

/**
 * Generate optimized image URL from Sanity image source
 * @param source - Sanity image source object
 * @returns Image URL builder instance
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Get optimized image URL with specific dimensions
 * @param source - Sanity image source object
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @returns Optimized image URL string
 */
export function getOptimizedImageUrl(
  source: SanityImageSource,
  width: number,
  height?: number
): string {
  const imageBuilder = urlFor(source).width(width).auto('format').quality(90);
  
  if (height) {
    return imageBuilder.height(height).url();
  }
  
  return imageBuilder.url();
}

/**
 * Get responsive image URLs for different screen sizes
 * @param source - Sanity image source object
 * @returns Object with URLs for different breakpoints
 */
export function getResponsiveImageUrls(source: SanityImageSource) {
  return {
    mobile: getOptimizedImageUrl(source, 640),
    tablet: getOptimizedImageUrl(source, 1024),
    desktop: getOptimizedImageUrl(source, 1920),
  };
}

/**
 * Get video URL from Sanity file asset
 * @param fileAsset - Sanity file asset object
 * @returns Video URL string or null
 */
export function getVideoUrl(fileAsset: { asset?: { _ref?: string } }): string | null {
  if (!fileAsset?.asset?._ref) return null;
  
  const [, id, extension] = fileAsset.asset._ref.split('-');
  return `https://cdn.sanity.io/files/${sanityClient.config().projectId}/${sanityClient.config().dataset}/${id}.${extension}`;
}

