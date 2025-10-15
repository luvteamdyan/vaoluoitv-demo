/**
 * Sanity Content Types
 * Type definitions for website content from Sanity CMS
 */

export interface SanityChatSupport {
  title: string;
  description: string;
  responseTime: string;
}

export interface SanityContactInfo {
  email?: string;
  phone?: string;
  chatSupport?: SanityChatSupport;
}

export interface SanityAboutUsStats {
  users?: string;
  matches?: string;
  uptime?: string;
  support?: string;
}

export interface SanityAboutUsContent {
  pageTitle: string;
  subtitle?: string;
  mission?: string;
  vision?: string;
  stats?: SanityAboutUsStats;
  contactInfo?: SanityContactInfo;
}

export interface SanityInvestorContent {
  sectionTitle: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  videoUrl?: string;
  videoFile?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  };
}

export interface SanityMarqueeContent {
  text: string;
  speed?: number;
}

export interface SanityHeroContent {
  backgroundImage?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  };
  backgroundImageAlt?: string;
}

export interface SanityLogoContent {
  image?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  };
  alt?: string;
}

export interface SanityInvestorLogoItem {
  image?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  };
  alt?: string;
  url?: string;
}

export interface SanityInvestorLogoContent {
  logo1?: SanityInvestorLogoItem;
  logo2?: SanityInvestorLogoItem;
}

export interface SanityFooterLink {
  text: string;
  url: string;
}

export interface SanityFooterContent {
  facebookLink: string;
  tiktokLink: string;
  description?: string;
  serviceLinks?: SanityFooterLink[];
  supportLinks?: SanityFooterLink[];
}

export interface SanityContentDocument {
  _id: string;
  _type: 'content';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  section: 'logo' | 'investor_logo' | 'about_us' | 'investor' | 'marquee' | 'hero';
  isActive: boolean;
  logo?: SanityLogoContent;
  investorLogo?: SanityInvestorLogoContent;
  aboutUs?: SanityAboutUsContent;
  investor?: SanityInvestorContent;
  marquee?: SanityMarqueeContent;
  hero?: SanityHeroContent;
}
