"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { adsConfigService } from "@/services/adsConfigService";
import { AdsConfig, AdsPosition, MediaType } from "@/types/ads-config";
import { BannerSkeleton } from "@/components/ui/states/SkeletonLoading";

const MainAdsBannerFallback = "https://cdn.vaoluoitv.com/images%2F1280x100_ads-banner.png";
const SubAdsBannerFallback1 = "https://cdn.vaoluoitv.com/videos%2F62971418-def9-4306-a4c6-f87a3f1fe8e8.mp4";
const SubAdsBannerFallback2 = "https://cdn.vaoluoitv.com/videos%2Fbc04f676-6c93-4288-a09e-0ba6817d3697.mp4";

export default function AdsBanner() {
  const [, setMainAdsConfig] = useState<AdsConfig | null>(null);
  const [subAdsConfigs, setSubAdsConfigs] = useState<AdsConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdsConfigs = async () => {
      try {
        const [mainAds, subAds1, subAds2, subAds3] = await Promise.all([
          adsConfigService.getByPosition(AdsPosition.MAIN_ADS),
          adsConfigService.getByPosition(AdsPosition.SUB_ADS_1),
          adsConfigService.getByPosition(AdsPosition.SUB_ADS_2),
          adsConfigService.getByPosition(AdsPosition.SUB_ADS_3),
        ]);

        setMainAdsConfig(mainAds);
        setSubAdsConfigs([subAds1, subAds2, subAds3].filter(Boolean) as AdsConfig[]);
      } catch (error) {
        // Service already handles errors gracefully, just log for debugging
        console.warn('Ads configs loading completed with fallbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdsConfigs();
  }, []);

  const handleAdClick = (config: AdsConfig) => {
    adsConfigService.trackClick(config.id);
  };

  const renderMedia = (config: AdsConfig, className: string, isMain: boolean = false) => {
    if (config.media_type === MediaType.VIDEO && config.media_url) {
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
    } else if (config.media_url) {
      // Responsive image với aspect ratio động và object-fit linh hoạt
      return (
        <div className={`relative w-full ${isMain ? 'h-[60px] sm:h-[70px] md:h-[80px] lg:h-[100px]' : 'h-[50px] sm:h-[60px] md:h-[65px] lg:h-[80px]'} overflow-hidden`}>
          <img
            src={config.media_url}
            alt={config.alt_text || config.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  };
  return (
    <section className="w-full py-1 px-1">
      <div className="w-full container mx-auto md:px-6 lg:px-32 xl:px-32">
        {/* Main Banner */}
        <div className="relative mb-1 w-full max-w-[1280px] mx-auto">
          <Link
            href="/"
            aria-label="Xem quảng cáo"
            className="block overflow-hidden rounded-md"
          >
            {/* Wrapper này giúp ảnh giữ tỷ lệ 1280x100, co giãn đều */}
            <div className="relative w-full" style={{ aspectRatio: "1280 / 100" }}>
              <Image
                src={MainAdsBannerFallback}
                alt="LUV MEDIA - 8 BƯỚC MAY MẮN - LUCK8 MEDIA - MEGA LIVE 15/09"
                fill
                className="object-contain"
                priority
                sizes="
                  (max-width: 640px) 95vw,
                  (max-width: 1024px) 90vw,
                  (max-width: 1280px) 80vw,
                  1280px
                "
              />
            </div>
          </Link>
        </div>

        {/* Sub Banners - Ẩn khi màn hình từ w-767 trở xuống */}
        <div className="hidden xl:flex gap-0.5 justify-center">
          {/* Sub Banner 1 */}
          <div className="relative overflow-hidden rounded-lg w-[640px] h-[100px]">
            {loading ? (
              <BannerSkeleton className="w-full h-full" />
            ) : subAdsConfigs[0] && subAdsConfigs[0].is_active ? (
              <Link 
                href={subAdsConfigs[0].link_url || "/"} 
                className="block w-full h-full"
                aria-label={subAdsConfigs[0].alt_text || subAdsConfigs[0].title}
                onClick={() => handleAdClick(subAdsConfigs[0])}
              >
                {renderMedia(subAdsConfigs[0], "w-full h-full object-cover", false)}
              </Link>
            ) : (
              <Link 
                href="/" 
                className="block w-full h-full"
                aria-label="Xem chương trình khuyến mãi 1"
              >
                <video
                  src={SubAdsBannerFallback1}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </Link>
            )}
          </div>

          {/* Sub Banner 2 */}
          <div className="relative overflow-hidden rounded-lg w-[640px] h-[100px]">
            {loading ? (
              <BannerSkeleton className="w-full h-full" />
            ) : subAdsConfigs[1] && subAdsConfigs[1].is_active ? (
              <Link 
                href={subAdsConfigs[1].link_url || "/"} 
                className="block w-full h-full"
                aria-label={subAdsConfigs[1].alt_text || subAdsConfigs[1].title}
                onClick={() => handleAdClick(subAdsConfigs[1])}
              >
                {renderMedia(subAdsConfigs[1], "w-full h-full object-cover", false)}
              </Link>
            ) : (
              <Link 
                href="/" 
                className="block w-full h-full"
                aria-label="Xem chương trình khuyến mãi 2"
              >
                <video
                  src={SubAdsBannerFallback2}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
