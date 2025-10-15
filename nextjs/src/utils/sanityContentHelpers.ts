import type { SanityAboutUsContent, SanityInvestorContent, SanityMarqueeContent, SanityHeroContent } from '@/types/sanity-content';
import { urlFor } from '@/lib/sanity';

/**
 * Sanity Content Helper Functions
 * Utility functions for working with website content from Sanity
 */

/**
 * Get default About Us content when Sanity data is not available
 * @returns Default About Us content
 */
export function getDefaultAboutUsContent(): SanityAboutUsContent {
  return {
    pageTitle: 'Về VaoluoiTV',
    subtitle: 'Chào mừng đến với Vaoluoitv - kênh phát sóng trực tiếp miễn phí mọi giải đấu bóng đá với đường truyền tốc độ cao, chất lượng hình ảnh full HD và có hỗ trợ bình luận tiếng Việt với dàn BLV cực kỳ nhiệt huyết. Trải nghiệm xem bóng đá đỉnh cao, miễn phí mọi trận cầu – chỉ có tại Vaoluoitv.com',
    mission: 'Trong bối cảnh nhu cầu xem bóng đá tại Việt Nam tăng cao, nhưng các kênh truyền hình truyền thống như VTV, K+ lại khiến người dùng mất một khoản phí không nhỏ. Nhận thấy điều này, Vaoluoitv đã được ra đời với sứ mệnh mang đến một website phát trực tiếp bóng đá miễn phí và đầy đủ mọi giải đấu từ World Cup, Euro, Champions League, Ngoại Hạng Anh,... cho đến các giải đấu quốc nội như V-league.',
    vision: 'Đến với Vaoluoitv, bạn sẽ được trải nghiệm dịch vụ xem bóng đá hoàn mới, không chỉ miễn phí, chất lượng sắc nét, mà còn được tương tác trực tiếp với những bình luận viên đầy nhiệt huyết nhưng cũng không kém phần hài hước. Chúng tôi luôn hướng đến việc giúp người xem không chỉ thưởng thức trọn vẹn trận đấu, mà còn cảm thấy thoải mái, vui tươi với những tương tác trực tiếp khi xem bóng đá tại Vaoluoitv.',
    stats: {
      users: '50K+',
      matches: '1000+',
      uptime: '99.9%',
      support: '24/7',
    },
    contactInfo: {
      email: 'luck8@luck.com',
      phone: '+84 96 686 60 88',
      chatSupport: {
        title: 'Chat trực tuyến',
        description: 'Hỗ trợ 24/7 qua chat',
        responseTime: 'Phản hồi trong 5 phút',
      },
    },
  };
}

/**
 * Merge Sanity content with defaults
 * @param sanityData - Data from Sanity
 * @returns Merged content data
 */
export function mergeAboutUsContent(sanityData: SanityAboutUsContent | null): SanityAboutUsContent {
  const defaultData = getDefaultAboutUsContent();
  
  if (!sanityData) {
    return defaultData;
  }

  return {
    pageTitle: sanityData.pageTitle || defaultData.pageTitle,
    subtitle: sanityData.subtitle || defaultData.subtitle,
    mission: sanityData.mission || defaultData.mission,
    vision: sanityData.vision || defaultData.vision,
    stats: {
      users: sanityData.stats?.users || defaultData.stats?.users,
      matches: sanityData.stats?.matches || defaultData.stats?.matches,
      uptime: sanityData.stats?.uptime || defaultData.stats?.uptime,
      support: sanityData.stats?.support || defaultData.stats?.support,
    },
    contactInfo: {
      email: sanityData.contactInfo?.email || defaultData.contactInfo?.email,
      phone: sanityData.contactInfo?.phone || defaultData.contactInfo?.phone,
      chatSupport: sanityData.contactInfo?.chatSupport || defaultData.contactInfo?.chatSupport,
    },
  };
}

/**
 * Get contact information with fallbacks
 * @param content - About Us content
 * @returns Contact information object
 */
export function getContactInfo(content: SanityAboutUsContent) {
  const defaultContact = getDefaultAboutUsContent().contactInfo!;
  
  return {
    email: content.contactInfo?.email || defaultContact.email,
    phone: content.contactInfo?.phone || defaultContact.phone,
    chatSupport: content.contactInfo?.chatSupport || defaultContact.chatSupport,
  };
}

/**
 * Get default Investor content when Sanity data is not available
 * @returns Default Investor content
 */
export function getDefaultInvestorContent(): SanityInvestorContent {
  return {
    sectionTitle: 'Giới thiệu về nhà đầu tư',
    description: 'Khám phá câu chuyện và tầm nhìn của nhà đầu tư chính đằng sau nền tảng bóng đá trực tiếp hàng đầu. Với kinh nghiệm dày dặn trong lĩnh vực thể thao và công nghệ, chúng tôi cam kết mang đến những trải nghiệm xem bóng đá tuyệt vời nhất cho người hâm mộ.',
    ctaText: 'Tìm hiểu thêm',
    ctaLink: 'https://luck8event.com/',
    videoUrl: 'https://cdn.vaoluoitv.com/videos/0922(13).mp4',
  };
}

/**
 * Merge Sanity Investor content with defaults
 * @param sanityData - Data from Sanity
 * @returns Merged content data
 */
export function mergeInvestorContent(sanityData: SanityInvestorContent | null): SanityInvestorContent {
  const defaultData = getDefaultInvestorContent();
  
  if (!sanityData) {
    return defaultData;
  }

  return {
    sectionTitle: sanityData.sectionTitle || defaultData.sectionTitle,
    description: sanityData.description || defaultData.description,
    ctaText: sanityData.ctaText || defaultData.ctaText,
    ctaLink: sanityData.ctaLink || defaultData.ctaLink,
    videoUrl: sanityData.videoUrl || defaultData.videoUrl,
    videoFile: sanityData.videoFile,
  };
}

/**
 * Get video URL for investor content
 * @param content - Investor content
 * @returns Video URL string
 */
export function getInvestorVideoUrl(content: SanityInvestorContent): string {
  // Priority 1: Video file asset URL (from Sanity CDN)
  if (content.videoFile?.asset?.url) {
    return content.videoFile.asset.url;
  }
  
  // Priority 2: Direct video URL
  if (content.videoUrl) {
    return content.videoUrl;
  }
  
  // Fallback to default
  return getDefaultInvestorContent().videoUrl || '';
}

/**
 * Get default Marquee content when Sanity data is not available
 * @returns Default Marquee content
 */
export function getDefaultMarqueeContent(): SanityMarqueeContent {
  return {
    text: '🏆 VAOLUOITV - XEM BÓNG ĐÁ TRỰC TIẾP MIỄN PHÍ - CHẤT LƯỢNG CAO - KHÔNG GIẬT LAG - CẬP NHẬT TIN TỨC BÓNG ĐÁ 24/7 🏆',
    speed: 30,
  };
}

/**
 * Merge Sanity Marquee content with defaults
 * @param sanityData - Data from Sanity
 * @returns Merged content data
 */
export function mergeMarqueeContent(sanityData: SanityMarqueeContent | null): SanityMarqueeContent {
  const defaultData = getDefaultMarqueeContent();
  
  if (!sanityData) {
    return defaultData;
  }

  return {
    text: sanityData.text || defaultData.text,
    speed: sanityData.speed || defaultData.speed,
  };
}

/**
 * Get default Hero content when Sanity data is not available
 * @returns Default Hero content
 */
export function getDefaultHeroContent(): SanityHeroContent {
  return {
    backgroundImageAlt: 'Hero Background',
  };
}

/**
 * Merge Sanity Hero content with defaults
 * @param sanityData - Data from Sanity
 * @returns Merged content data
 */
export function mergeHeroContent(sanityData: SanityHeroContent | null): SanityHeroContent {
  const defaultData = getDefaultHeroContent();
  
  if (!sanityData) {
    return defaultData;
  }

  return {
    backgroundImage: sanityData.backgroundImage,
    backgroundImageAlt: sanityData.backgroundImageAlt || defaultData.backgroundImageAlt,
  };
}

/**
 * Get background image URL for hero content
 * @param content - Hero content
 * @returns Background image URL string or null
 */
export function getHeroBackgroundUrl(content: SanityHeroContent | null): string | null {
  // Check if Sanity has background image
  if (content?.backgroundImage) {
    return urlFor(content.backgroundImage)
      .width(1920)
      .auto('format')
      .quality(90)
      .url();
  }
  
  // Return null to use fallback in component
  return null;
}
