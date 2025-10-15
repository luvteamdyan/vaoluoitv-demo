"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BackgroundBanner from "@/assets/images/HeroBackground/1920 x 700 background.png";
import { adsConfigService } from "@/services/adsConfigService";
import { AdsConfig, AdsPosition, MediaType } from "@/types/ads-config";
import { VideoSkeleton, BannerSkeleton } from "@/components/ui/states/SkeletonLoading";

export default function HeroSection() {
  // CSS cho animation float
  const floatStyle = `
    @keyframes float {
      0%, 100% { transform: translateY(5px); }
      50% { transform: translateY(-5px); }
    }
  `;
  const [mainBannerConfig, setMainBannerConfig] = useState<AdsConfig | null>(null);
  const [leftBannerConfig, setLeftBannerConfig] = useState<AdsConfig | null>(null);
  const [rightBannerConfig, setRightBannerConfig] = useState<AdsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback URLs
  const fallbackVideoUrl = "https://cdn.vaoluoitv.com/videos%2Fhero_main_desktop_banner.mp4";

  // Left banner fallback URL
  const fallbackLeftLarge = "https://cdn.vaoluoitv.com/videos/left_banner_hero.mp4";

  // Right banner fallback URL
  const fallbackRightLarge = "https://cdn.vaoluoitv.com/videos/right_banner_hero.mp4";

  useEffect(() => {
    const loadHeroBanners = async () => {
      try {
        const [mainBanner, leftBanner, rightBanner] = await Promise.all([
          adsConfigService.getByPosition(AdsPosition.HERO_MAIN),
          adsConfigService.getByPosition(AdsPosition.HERO_LEFT),
          adsConfigService.getByPosition(AdsPosition.HERO_RIGHT),
        ]);

        setMainBannerConfig(mainBanner);
        setLeftBannerConfig(leftBanner);
        setRightBannerConfig(rightBanner);
      } catch (error) {
        // Service already handles errors gracefully, just log for debugging
        console.warn('Hero banners loading completed with fallbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroBanners();
  }, []);

  const renderMedia = (config: AdsConfig, className: string) => {
    if (config.media_type === MediaType.VIDEO && config.media_url) {
      // Check if it's a GIF file (should be rendered as image, not video)
      const isGif = config.media_url.toLowerCase().includes('.gif');
      
      if (isGif) {
        // Render GIF as image
        return (
          <img
            src={config.media_url}
            alt={config.alt_text || config.title}
            width={300}
            height={400}
            className={className}
          />
        );
      } else {
        // Render as video
        return (
          <video
            src={config.media_url}
            className={className}
            autoPlay
            muted
            loop
            playsInline
          />
        );
      }
    } else if (config.media_url) {
      return (
        <img
          src={config.media_url}
          alt={config.alt_text || config.title}
          width={300}
          height={400}
          className={className}
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
    config: AdsConfig | null;
    className: string;
    fallbackUrl: string;
    altText: string;
    loading: boolean;
    containerClassName: string;
    animationStyle: React.CSSProperties;
  }) => {
    return (
      <div
        className={containerClassName}
        style={animationStyle}
      >
        {loading ? (
          <BannerSkeleton className="w-full h-full" />
        ) : config && config.is_active && config.media_url && config.media_type !== MediaType.VIDEO ? (
          // Responsive image từ config API
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={config.media_url}
              alt={config.alt_text || config.title || altText}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          // Hiển thị video fallback
          <video
            className={className}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={config && config.is_active && config.media_url ? config.media_url : fallbackUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        )}
      </div>
    );
  };


  return (
    <section className="w-full relative">
      <style dangerouslySetInnerHTML={{ __html: floatStyle }} />
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <img
          src={BackgroundBanner.src}
          alt="Hero Background"
          className="w-full h-full object-cover"
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
              <div className="relative bg-black rounded-lg overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"></div>

                {loading ? (
                  <VideoSkeleton className="w-full h-[123px] md:h-[200px]" />
                ) : mainBannerConfig && mainBannerConfig.is_active ? (
                  renderMedia(mainBannerConfig, "w-full h-[123px] md:h-[200px] object-cover")
                ) : (
                  <video
                    src={fallbackVideoUrl}
                    autoPlay
                    muted
                    loop
                    className="w-full h-[123px] md:h-[200px] object-cover"
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
              <div className="relative bg-black rounded-lg overflow-hidden border-4 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.6),inset_0_0_20px_rgba(0,0,0,0.3)]">
                {/* Inner lighting effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10 pointer-events-none"></div>

                {loading ? (
                  <VideoSkeleton className="w-full h-full" />
                ) : mainBannerConfig && mainBannerConfig.is_active ? (
                  renderMedia(mainBannerConfig, "w-full h-full object-contain")
                ) : (
                  <video
                    src={fallbackVideoUrl}
                    autoPlay
                    muted
                    loop
                    className="w-full h-[400px] object-contain"
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
            <div className="relative bg-black rounded-lg overflow-hidden border-4 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.6),inset_0_0_20px_rgba(0,0,0,0.3)]">
              {/* Inner lighting effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10 pointer-events-none"></div>

              {loading ? (
                <VideoSkeleton className="w-full h-full" />
              ) : mainBannerConfig && mainBannerConfig.is_active ? (
                renderMedia(mainBannerConfig, "w-full h-full object-contain")
              ) : (
                <video
                  src={fallbackVideoUrl}
                  autoPlay
                  muted
                  loop
                  className="w-full h-[400px] object-contain"
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
