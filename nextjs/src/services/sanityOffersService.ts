import { sanityClient } from '@/lib/sanity';
import { SanityOffer } from '@/types/sanity-offers';

export type { SanityOffer };

/**
 * Get all active offers from Sanity
 */
export const getAllOffers = async (): Promise<SanityOffer[]> => {
  try {
    const query = `*[_type == "offer"
      && isActive == true
      && (!defined(startDate) || startDate <= now())
      && (!defined(endDate) || endDate >= now())
    ] | order(priority desc, _createdAt desc) {
      _id, _type, _createdAt, _updatedAt, _rev, title, subtitle, imageUrl, headerImage,
      content, terms, notes, isActive, priority, startDate, endDate, targetAudience
    }`;

    const offers = await sanityClient.fetch<SanityOffer[]>(query);
    return offers || [];
  } catch (error) {
    console.error('Error fetching offers from Sanity:', error);
    return [];
  }
};

/**
 * Get offer by ID
 */
export const getOfferById = async (id: string): Promise<SanityOffer | null> => {
  try {
    const query = `*[_type == "offer" && _id == $id][0] {
      _id, _type, _createdAt, _updatedAt, _rev, title, subtitle, imageUrl, headerImage,
      content, terms, notes, isActive, priority, startDate, endDate, targetAudience
    }`;

    const offer = await sanityClient.fetch<SanityOffer>(query, { id });
    return offer || null;
  } catch (error) {
    console.error('Error fetching offer by ID from Sanity:', error);
    return null;
  }
};

/**
 * Get offers by target audience
 */
export const getOffersByAudience = async (audience: string): Promise<SanityOffer[]> => {
  try {
    const query = `*[_type == "offer"
      && isActive == true
      && (!defined(startDate) || startDate <= now())
      && (!defined(endDate) || endDate >= now())
      && (targetAudience == null || $audience in targetAudience || "all" in targetAudience)
    ] | order(priority desc, _createdAt desc) {
      _id, _type, _createdAt, _updatedAt, _rev, title, subtitle, imageUrl, headerImage,
      content, terms, notes, isActive, priority, startDate, endDate, targetAudience
    }`;

    const offers = await sanityClient.fetch<SanityOffer[]>(query, { audience });
    return offers || [];
  } catch (error) {
    console.error('Error fetching offers by audience from Sanity:', error);
    return [];
  }
};

/**
 * Get limited number of offers
 */
export const getOffers = async (limit: number = 6): Promise<SanityOffer[]> => {
  try {
    const query = `*[_type == "offer"
      && isActive == true
      && (!defined(startDate) || startDate <= now())
      && (!defined(endDate) || endDate >= now())
    ] | order(priority desc, _createdAt desc)[0...$limit] {
      _id, _type, _createdAt, _updatedAt, _rev, title, subtitle, imageUrl, headerImage,
      content, terms, notes, isActive, priority, startDate, endDate, targetAudience
    }`;

    const offers = await sanityClient.fetch<SanityOffer[]>(query, { limit });
    return offers || [];
  } catch (error) {
    console.error('Error fetching limited offers from Sanity:', error);
    return [];
  }
};
