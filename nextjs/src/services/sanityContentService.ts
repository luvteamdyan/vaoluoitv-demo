import { sanityClient } from '@/lib/sanity';
import type { SanityContentDocument, SanityLogoContent, SanityInvestorLogoContent, SanityAboutUsContent, SanityInvestorContent, SanityMarqueeContent, SanityHeroContent, SanityFooterContent } from '@/types/sanity-content';

/**
 * Sanity Content Service
 * Handles fetching website content from Sanity CMS
 */
export class SanityContentService {
  /**
   * Get Logo content from content document
   * @returns Logo content or null
   */
  async getLogoContent(): Promise<SanityLogoContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "logo" 
        && isActive == true
        && defined(logo)
      ][0] {
        logo {
          image {
            asset->{
              _id,
              url
            }
          },
          alt
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.logo || null;
    } catch (error) {
      console.error('Error fetching Logo content:', error);
      return null;
    }
  }

  /**
   * Get Investor Logo content from content document
   * @returns Investor Logo content or null
   */
  async getInvestorLogoContent(): Promise<SanityInvestorLogoContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "investor_logo" 
        && isActive == true
        && defined(investorLogo)
      ][0] {
        investorLogo {
          logo1 {
            image {
              asset->{
                _id,
                url
              }
            },
            alt,
            url
          },
          logo2 {
            image {
              asset->{
                _id,
                url
              }
            },
            alt,
            url
          }
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.investorLogo || null;
    } catch (error) {
      console.error('Error fetching Investor Logo content:', error);
      return null;
    }
  }

  /**
   * Get About Us content from content document
   * @returns About Us content or null
   */
  async getAboutUsContent(): Promise<SanityAboutUsContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "about_us" 
        && isActive == true
        && defined(aboutUs)
      ][0] {
        aboutUs {
          pageTitle,
          subtitle,
          mission,
          vision,
          stats {
            users,
            matches,
            uptime,
            support
          },
          contactInfo {
            email,
            phone,
            chatSupport {
              title,
              description,
              responseTime
            }
          }
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.aboutUs || null;
    } catch (error) {
      console.error('Error fetching About Us content:', error);
      return null;
    }
  }

  /**
   * Get Investor content from content document
   * @returns Investor content or null
   */
  async getInvestorContent(): Promise<SanityInvestorContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "investor" 
        && isActive == true
        && defined(investor)
      ][0] {
        investor {
          sectionTitle,
          description,
          ctaText,
          ctaLink,
          videoUrl,
          videoFile {
            asset->{
              _id,
              url
            }
          }
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.investor || null;
    } catch (error) {
      console.error('Error fetching Investor content:', error);
      return null;
    }
  }

  /**
   * Get Marquee content from content document
   * @returns Marquee content or null
   */
  async getMarqueeContent(): Promise<SanityMarqueeContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "marquee" 
        && isActive == true
        && defined(marquee)
      ][0] {
        marquee {
          text,
          speed
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.marquee || null;
    } catch (error) {
      console.error('Error fetching Marquee content:', error);
      return null;
    }
  }

  /**
   * Get Hero content from content document
   * @returns Hero content or null
   */
  async getHeroContent(): Promise<SanityHeroContent | null> {
    try {
      const query = `*[_type == "content" 
        && section == "hero" 
        && isActive == true
        && defined(hero)
      ][0] {
        hero {
          backgroundImage {
            asset->{
              _id,
              url
            }
          },
          backgroundImageAlt
        }
      }`;

      const result = await sanityClient.fetch(query);
      
      return result?.hero || null;
    } catch (error) {
      console.error('Error fetching Hero content:', error);
      return null;
    }
  }

  /**
   * Get Footer content from footer document
   * @returns Footer content or null
   */
  async getFooterContent(): Promise<SanityFooterContent | null> {
    try {
      const query = `*[_type == "layout"
        && section == "footer"
        && isActive == true
        && defined(footer)
      ][0] {
        footer {
          facebookLink,
          tiktokLink,
          description,
          serviceLinks[] {
            text,
            url
          },
          supportLinks[] {
            text,
            url
          }
        }
      }`;

      const result = await sanityClient.fetch(query);

      return result?.footer || null;
    } catch (error) {
      console.error('Error fetching Footer content:', error);
      return null;
    }
  }

  /**
   * Get content by document ID
   * @param documentId - Sanity document ID
   * @returns Content or null
   */
  async getContentById(documentId: string): Promise<SanityAboutUsContent | null> {
    try {
      const query = `*[_id == $documentId && _type == "content" && section == "about_us"][0] {
        aboutUs {
          pageTitle,
          subtitle,
          mission,
          vision,
          stats {
            users,
            matches,
            uptime,
            support
          },
          contactInfo {
            email,
            phone,
            chatSupport {
              title,
              description,
              responseTime
            }
          }
        }
      }`;

      const params = { documentId };
      const result = await sanityClient.fetch(query, params);
      
      return result?.aboutUs || null;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }
  }

  /**
   * Get all content documents by section
   * @param section - Content section type
   * @returns Array of content documents
   */
  async getContentBySection(section: 'logo' | 'investor_logo' | 'about_us' | 'investor' | 'marquee' | 'hero'): Promise<SanityContentDocument[]> {
    try {
      const query = `*[_type == "content" && section == $section] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        title,
        section,
        isActive,
        aboutUs {
          pageTitle,
          subtitle,
          mission,
          vision,
          contactInfo {
            email,
            phone,
            chatSupport {
              title,
              description,
              responseTime
            }
          }
        }
      }`;

      const params = { section };
      const result = await sanityClient.fetch(query, params);
      
      return result || [];
    } catch (error) {
      console.error(`Error fetching ${section} content:`, error);
      return [];
    }
  }

  /**
   * Get all content documents
   * @returns Array of all content documents
   */
  async getAllContent(): Promise<SanityContentDocument[]> {
    try {
      const query = `*[_type == "content"] | order(section asc, _createdAt desc) {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        title,
        section,
        isActive
      }`;

      const result = await sanityClient.fetch(query);
      
      return result || [];
    } catch (error) {
      console.error('Error fetching all content:', error);
      return [];
    }
  }
}

// Export singleton instance
export const sanityContentService = new SanityContentService();
