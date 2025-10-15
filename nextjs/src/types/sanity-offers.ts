/**
 * Sanity Offer Types
 */

export interface SanityContentBlock {
  type: 'text' | 'image';
  value?: string;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
}

export interface SanityTermBlock {
  type: 'text' | 'image';
  value?: string;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
}

export interface SanityOffer {
  _id: string;
  _type: 'offer';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  subtitle?: string;
  imageUrl?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  headerImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  content?: SanityContentBlock[];
  terms?: SanityTermBlock[];
  notes?: string[];
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: string[];
}

// Helper function moved to utils/sanityOfferHelpers.ts to avoid duplication

