"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { sanityAdsService, SanityAdvertisement } from "@/services/sanityAdsService";
import { SanityAdsPosition } from "@/types/sanity-ads";
import {
  getAdMediaUrl,
  shouldDisplayAd,
  getAdLinkWithTracking
} from "@/utils/sanityAdHelpers";
import { BannerSkeleton } from "@/components/ui/states/SkeletonLoading";

// Fallback URLs
const FALLBACK_MAIN = "https://cdn.vaoluoitv.com/images%2F1280x100_ads-banner.png";
const FALLBACK_SUB_1 = "https://cdn.vaoluoitv.com/videos%2Fsubadbannerupdate.mp4";
const FALLBACK_SUB_2 = "https://cdn.vaoluoitv.com/images%2Fsubad2update.gif";

export default function SanityAdsBanner() {
  const [mainAd, setMainAd] = useState<SanityAdvertisement | null>(null);
  const [subAds, setSubAds] = useState<SanityAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const positions = [
          SanityAdsPosition.MAIN_ADS,
          SanityAdsPosition.SUB_ADS_1,
          SanityAdsPosition.SUB_ADS_2,
        ];

        const adsData = await sanityAdsService.getAdsByPositions(positions);

        setMainAd(adsData[SanityAdsPosition.MAIN_ADS] || null);
        setSubAds([
          adsData[SanityAdsPosition.SUB_ADS_1],
          adsData[SanityAdsPosition.SUB_ADS_2],
        ].filter(Boolean) as SanityAdvertisement[]);
      } catch (error) {
        console.error("Error loading Sanity ads:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  const renderMainAdMedia = (ad: SanityAdvertisement) => {
    const mediaUrl = getAdMediaUrl(ad);

    if (!mediaUrl) return null;

    // Kiểm tra loại file từ URL
    const isVideo = mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.webm');
    const isGif = mediaUrl.toLowerCase().includes('.gif');

    if (ad.mediaType === 'video' || isVideo) {
      return (
        <video
          src={mediaUrl}
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={ad.altText || ad.title}
        />
      );
    } else if (isGif) {
      // GIF dùng img tag để tự động chạy animation
      return (
        <img
          src={mediaUrl}
          alt={ad.altText || ad.title}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      );
    } else if (mediaUrl) {
      // Main banner dùng Image component với aspect ratio cho ảnh thường
      return (
        <Image
          src={mediaUrl}
          alt={ad.altText || ad.title}
          fill
          className="object-contain"
          priority={false}
          loading="lazy"
          unoptimized
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 1280px"
        />
      );
    }
    return null;
  };

  const renderMedia = (ad: SanityAdvertisement, className: string, isMain: boolean = false) => {
    const mediaUrl = getAdMediaUrl(ad);

    if (!mediaUrl) return null;

    // Kiểm tra loại file từ URL để xác định cách render
    const isVideo = mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.webm');

    // Nếu mediaType là video hoặc URL chứa video
    if (ad.mediaType === 'video' || isVideo) {
      // Video fill container trực tiếp
      return (
        <video
          src={mediaUrl}
          className={className}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={ad.altText || ad.title}
        />
      );
    } else if (mediaUrl) {
      // Image fill wrapper div với responsive heights. 
      // Dùng <img> cho sub-banners để dễ kiểm soát `object-contain` trong container aspect-ratio
      if (isMain) {
        return (
            <div className={`relative w-full h-full overflow-hidden`}>
                <Image
                    src={mediaUrl}
                    alt={ad.altText || ad.title}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                    sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 1280px"
                />
            </div>
        )
      }

      // Sub-banners 639x100 - hỗ trợ cả ảnh và GIF
      return (
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={mediaUrl}
            alt={ad.altText || ad.title}
            // `object-contain` đảm bảo không bị crop, giữ nguyên tỷ lệ ảnh/video
            className="w-full h-full object-contain" 
            loading="lazy"
          />
        </div>
      );
    }
    return null;
  };

  const renderFallbackMain = () => (
    <Link href="/" aria-label="Xem quảng cáo" className="block overflow-hidden rounded-sm">
      <div className="relative w-full" style={{ aspectRatio: "1280 / 100" }}>
        <Image
          src={FALLBACK_MAIN}
          alt="Main advertising banner"
          fill
          className="object-contain"
          priority={false}
          loading="lazy"
          unoptimized
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 1280px"
        />
      </div>
    </Link>
  );

  const renderFallbackSub = (index: number) => {
    const fallbackUrl = index === 0 ? FALLBACK_SUB_1 : FALLBACK_SUB_2;
    
    // Kiểm tra loại file để render phù hợp
    const isVideo = fallbackUrl.toLowerCase().includes('.mp4') || fallbackUrl.toLowerCase().includes('.webm');
    const isGif = fallbackUrl.toLowerCase().includes('.gif');
    const isImage = fallbackUrl.toLowerCase().includes('.png') || fallbackUrl.toLowerCase().includes('.jpg') || fallbackUrl.toLowerCase().includes('.jpeg') || fallbackUrl.toLowerCase().includes('.webp');

    return (
      <Link href="/" className="block w-full h-full" aria-label={`Xem chương trình khuyến mãi ${index + 1}`}>
        {isVideo ? (
          <video
            src={fallbackUrl}
            className="w-full h-full object-contain" 
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
        ) : isGif ? (
          <img
            src={fallbackUrl}
            alt={`Fallback banner ${index + 1}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : isImage ? (
          <img
            src={fallbackUrl}
            alt={`Fallback banner ${index + 1}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          // Fallback cho trường hợp không xác định được loại file
          <video
            src={fallbackUrl}
            className="w-full h-full object-contain" 
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
        )}
      </Link>
    );
  };

  return (
    <section className="w-full py-1 px-1">
      <div className="w-full container mx-auto md:px-6 lg:px-32 xl:px-32">
        {/* Main Banner */}
        <div className="relative mb-1 w-full max-w-[1280px] mx-auto">
          {loading ? (
            <BannerSkeleton className="w-full h-[100px]" />
          ) : mainAd && shouldDisplayAd(mainAd) ? (
            <Link
              href={getAdLinkWithTracking(mainAd, 'website', 'banner')}
              aria-label={mainAd.altText || mainAd.title}
              className="block overflow-hidden rounded-sm"
            >
              {/* Wrapper này giúp ảnh giữ tỷ lệ 1280x100, co giãn đều */}
              <div className="relative w-full" style={{ aspectRatio: "1280 / 100" }}>
                {renderMainAdMedia(mainAd)}
              </div>
            </Link>
          ) : (
            renderFallbackMain()
          )}
        </div>

        {/* Sub Banners: 639x100, cách nhau gap 1, nằm ngang trái phải - Ẩn ở MD trở xuống */}
        <div
          className="
            hidden md:flex flex-wrap justify-center items-center gap-1
            w-full max-w-[1280px] mx-aut
          "
        >
          {/* Sub Banner 1 */}
          <div
            className="
                relative overflow-hidden rounded-sm
                /* Cố định tỷ lệ 639/100 */
                aspect-[639/100] 
                /* min-w cho mobile, max-w để giữ kích thước tối đa 639px */
                flex-1 min-w-[300px] max-w-[639px]
                transition-all duration-500 ease-in-out
            "
          >
            {loading ? (
              <BannerSkeleton className="w-full h-full rounded-sm" />
            ) : subAds[0] && shouldDisplayAd(subAds[0]) ? (
              <Link
                href={getAdLinkWithTracking(subAds[0], "website", "sub_banner")}
                className="block w-full h-full"
                aria-label={subAds[0].altText || subAds[0].title}
              >
                {/* Sử dụng w-full h-full object-contain trong renderMedia */}
                {renderMedia(subAds[0], "w-full h-full object-contain rounded-sm", false)}
              </Link>
            ) : (
              renderFallbackSub(0)
            )}
          </div>

          {/* Sub Banner 2 */}
          <div
            className="
                relative overflow-hidden rounded-sm
                /* Cố định tỷ lệ 639/100 */
                aspect-[639/100] 
                /* min-w cho mobile, max-w để giữ kích thước tối đa 639px */
                flex-1 min-w-[300px] max-w-[639px]
                transition-all duration-500 ease-in-out
            "
          >
            {loading ? (
              <BannerSkeleton className="w-full h-full rounded-sm" />
            ) : subAds[1] && shouldDisplayAd(subAds[1]) ? (
              <Link
                href={getAdLinkWithTracking(subAds[1], "website", "sub_banner")}
                className="block w-full h-full"
                aria-label={subAds[1].altText || subAds[1].title}
              >
                {/* Sử dụng w-full h-full object-contain trong renderMedia */}
                {renderMedia(subAds[1], "w-full h-full object-contain rounded-sm", false)}
              </Link>
            ) : (
              renderFallbackSub(1)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}