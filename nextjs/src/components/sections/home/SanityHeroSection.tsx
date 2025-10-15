"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BackgroundBanner from "@/assets/images/HeroBackground/1920 x 700 background.png";
import { sanityAdsService, SanityAdvertisement } from "@/services/sanityAdsService";
import { SanityAdsPosition } from "@/types/sanity-ads";
import { 
  getAdMediaUrl, 
  shouldDisplayAd,
  getAdLinkWithTracking 
} from "@/utils/sanityAdHelpers";
import { VideoSkeleton, BannerSkeleton } from "@/components/ui/states/SkeletonLoading";
import { sanityContentService } from "@/services/sanityContentService";
import { getHeroBackgroundUrl } from "@/utils/sanityContentHelpers";
import type { SanityHeroContent } from "@/types/sanity-content";

export default function SanityHeroSection() {
  // CSS cho animation float
  const floatStyle = `
    @keyframes float {
      0%, 100% { transform: translateY(5px); }
      50% { transform: translateY(-5px); }
    }
  `;
  
  const [mainBannerConfig, setMainBannerConfig] = useState<SanityAdvertisement | null>(null);
  const [leftBannerConfig, setLeftBannerConfig] = useState<SanityAdvertisement | null>(null);
  const [rightBannerConfig, setRightBannerConfig] = useState<SanityAdvertisement | null>(null);
  const [heroContent, setHeroContent] = useState<SanityHeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback URLs
  const fallbackVideoUrl = "https://cdn.vaoluoitv.com/videos%2Fhero_main_desktop_banner.mp4";
  const fallbackLeftLarge = "https://cdn.vaoluoitv.com/videos/left_banner_hero.mp4";
  const fallbackRightLarge = "https://cdn.vaoluoitv.com/videos/right_banner_hero.mp4";

  useEffect(() => {
    const loadHeroBanners = async () => {
      try {
        // Load hero ads
        const positions = [
          SanityAdsPosition.HERO_MAIN,
          SanityAdsPosition.HERO_LEFT,
          SanityAdsPosition.HERO_RIGHT,
        ];

        const adsData = await sanityAdsService.getAdsByPositions(positions);
        
        setMainBannerConfig(adsData[SanityAdsPosition.HERO_MAIN] || null);
        setLeftBannerConfig(adsData[SanityAdsPosition.HERO_LEFT] || null);
        setRightBannerConfig(adsData[SanityAdsPosition.HERO_RIGHT] || null);

        // Load hero background content
        const heroData = await sanityContentService.getHeroContent();
        setHeroContent(heroData);
      } catch (error) {
        console.error("Error loading Sanity hero content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroBanners();
  }, []);

  const handleAdClick = (ad: SanityAdvertisement) => {
    if (ad.linkUrl) {
      const trackingUrl = getAdLinkWithTracking(ad, 'vaoluoitv', 'hero_section');
      window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderMedia = (ad: SanityAdvertisement, className: string) => {
    const mediaUrl = getAdMediaUrl(ad);
    
    if (!mediaUrl) return null;

    // const clickHandler = () => handleAdClick(ad); // Unused - click handled by parent container

    if (ad.mediaType === 'video') {
      // Check if it's a GIF file (should be rendered as image, not video)
      const isGif = mediaUrl.toLowerCase().includes('.gif');
      
      if (isGif) {
        // Render GIF as image
        return (
          <img
            src={mediaUrl}
            alt={ad.altText || ad.title}
            width={300}
            height={400}
            className={`${className} cursor-pointer`}
          />
        );
      } else {
        // Render as video
        return (
          <video
            src={mediaUrl}
            className={`${className} cursor-pointer`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        );
      }
    } else if (mediaUrl) {
      return (
        <img
          src={mediaUrl}
          alt={ad.altText || ad.title}
          width={300}
          height={400}
          className={`${className} cursor-pointer`}
        />
      );
    }
    return null;
  };

  // Component cho responsive banner đơn giản
  const ResponsiveBanner = ({
    config,
    className,
    fallbackUrl,
    altText,
    loading,
    containerClassName,
    animationStyle
  }: {
    config: SanityAdvertisement | null;
    className: string;
    fallbackUrl: string;
    altText: string;
    loading: boolean;
    containerClassName: string;
    animationStyle: React.CSSProperties;
  }) => {
    const handleBannerClick = () => {
      if (config && config.linkUrl) {
        const trackingUrl = getAdLinkWithTracking(config, 'vaoluoitv', 'hero_section');
        window.open(trackingUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div
        className={`${containerClassName} cursor-pointer`}
        style={animationStyle}
        onClick={handleBannerClick}
      >
        {loading ? (
          <BannerSkeleton className="w-full h-full" />
        ) : config && shouldDisplayAd(config) && config.mediaType === 'image' ? (
          // Responsive image từ Sanity
          <div className="relative w-full h-full overflow-hidden cursor-pointer">
            <Image
              src={getAdMediaUrl(config)!}
              alt={config.altText || config.title || altText}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          // Hiển thị video fallback hoặc Sanity video
          <video
            className={`${className} cursor-pointer`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={config && shouldDisplayAd(config) ? getAdMediaUrl(config)! : fallbackUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        )}
      </div>
    );
  };

  // Get background URL from Sanity or use fallback
  const backgroundUrl = getHeroBackgroundUrl(heroContent) || BackgroundBanner.src;
  const backgroundAlt = heroContent?.backgroundImageAlt || "Hero Background";

  return (
    <section className="w-full relative">
      <style dangerouslySetInnerHTML={{ __html: floatStyle }} />
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundUrl}
          alt={backgroundAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="relative z-10 block xl:hidden lg:hidden">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-3">
          {/* Video Section - Mobile */}
          <div className="mb-3 md:mb-4">
            <div className="relative overflow-hidden border-2 md:border-3 border-yellow-500 shadow-lg rounded-lg">
              {/* Glow effect wrapper */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg blur-sm opacity-75 animate-pulse"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg blur-[2px] opacity-50"></div>

              {/* Main content */}
              <div 
                className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
                onClick={() => mainBannerConfig && handleAdClick(mainBannerConfig)}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"></div>

                {loading ? (
                  <VideoSkeleton className="w-full h-[123px] md:h-[200px]" />
                ) : mainBannerConfig && shouldDisplayAd(mainBannerConfig) ? (
                  renderMedia(mainBannerConfig, "w-full h-[123px] md:h-[200px] object-cover")
                ) : (
                  <video
                    src={fallbackVideoUrl}
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    className="w-full h-[123px] md:h-[200px] object-cover cursor-pointer"
                  />
                )}

                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-yellow-400 opacity-60"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-yellow-400 opacity-60"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-yellow-400 opacity-60"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-yellow-400 opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Large screens only (above 1440px) */}
      <div className="relative z-10 hidden 2xl:flex items-center justify-center min-h-[400px] w-full">
        {/* Container để căn giữa toàn bộ hero section */}
        <div className="flex items-center mx-2 justify-center gap-8 w-full max-w-[1920px]">
          {/* Banner Left */}
          <div className="flex-shrink-0">
            <ResponsiveBanner
              config={leftBannerConfig}
              className="object-cover w-auto h-[400px] rounded-lg"
              fallbackUrl={fallbackLeftLarge}
              altText="Left Banner"
              loading={loading}
              containerClassName="w-[250px] h-[400px] flex items-center justify-center shadow-lg shadow-amber-200 rounded-lg"
              animationStyle={{
                animation: 'float 3s ease-in-out infinite',
                animationDelay: '0s'
              }}
            />
          </div>

          {/* Video (cột giữa) - Flexible width với margin để tạo khoảng cách */}
          <div className="flex-1 relative my-2 max-w-[1280px]">
            {/* Enhanced glow effect container */}
            <div className="relative overflow-hidden rounded-lg">
              {/* Multi-layer glow effects */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg blur-md opacity-60 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg blur-sm opacity-80"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 rounded-lg blur-[1px] opacity-40"></div>

              {/* Main video container */}
              <div 
                className="relative bg-black rounded-lg overflow-hidden border-4 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.6),inset_0_0_20px_rgba(0,0,0,0.3)] cursor-pointer"
                onClick={() => mainBannerConfig && handleAdClick(mainBannerConfig)}
              >
                {/* Inner lighting effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10 pointer-events-none"></div>

                {loading ? (
                  <VideoSkeleton className="w-full h-full" />
                ) : mainBannerConfig && shouldDisplayAd(mainBannerConfig) ? (
                  renderMedia(mainBannerConfig, "w-full h-full object-contain")
                ) : (
                  <video
                    src={fallbackVideoUrl}
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    className="w-full h-full object-contain cursor-pointer"
                  />
                )}

                {/* Corner decorative elements */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-yellow-400 opacity-70"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-yellow-400 opacity-70"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-yellow-400 opacity-70"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-yellow-400 opacity-70"></div>

                {/* Center decorative line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>

          {/* Banner Right */}
          <div className="flex-shrink-0">
            <ResponsiveBanner
              config={rightBannerConfig}
              className="object-cover w-auto h-[400px] rounded-lg"
              fallbackUrl={fallbackRightLarge}
              altText="Right Banner"
              loading={loading}
              containerClassName="w-[250px] h-[400px] flex items-center justify-center shadow-lg shadow-amber-200 rounded-lg"
              animationStyle={{
                animation: 'float 3s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Medium screens (1440px and below) - Chỉ hiển thị main video */}
      <div className="relative z-10 hidden lg:flex 2xl:hidden items-center justify-center min-h-[400px] px-4">
        {/* Video (cột giữa) - Full width cho màn hình vừa */}
        <div className="w-full max-w-[1280px] relative my-2">
          {/* Enhanced glow effect container */}
          <div className="relative overflow-hidden rounded-lg">
            {/* Multi-layer glow effects */}
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg blur-md opacity-60 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg blur-sm opacity-80"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 rounded-lg blur-[1px] opacity-40"></div>

            {/* Main video container */}
            <div 
              className="relative bg-black rounded-lg overflow-hidden border-4 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.6),inset_0_0_20px_rgba(0,0,0,0.3)] cursor-pointer"
              onClick={() => mainBannerConfig && handleAdClick(mainBannerConfig)}
            >
              {/* Inner lighting effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10 pointer-events-none"></div>

              {loading ? (
                <VideoSkeleton className="w-full h-full" />
              ) : mainBannerConfig && shouldDisplayAd(mainBannerConfig) ? (
                renderMedia(mainBannerConfig, "w-full h-full object-contain")
              ) : (
                <video
                  src={fallbackVideoUrl}
                  autoPlay
                  muted
                  loop
                  preload="metadata"
                  className="w-full h-full object-contain cursor-pointer"
                />
              )}

              {/* Corner decorative elements */}
              <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-yellow-400 opacity-70"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-yellow-400 opacity-70"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-yellow-400 opacity-70"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-yellow-400 opacity-70"></div>

              {/* Center decorative line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
