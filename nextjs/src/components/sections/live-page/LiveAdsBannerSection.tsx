"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sanityAdsService } from "@/services/sanityAdsService";
import { getAdMediaUrl } from "@/utils/sanityAdHelpers";
import type { SanityAdvertisement } from "@/types/sanity-ads";
import { urlFor } from "@/lib/sanity";

export default function SubAdsBannerSection() {
  const [liveAd1, setLiveAd1] = useState<SanityAdvertisement | null>(null);
  const [liveAd2, setLiveAd2] = useState<SanityAdvertisement | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackImage = "https://cdn.vaoluoitv.com/images%2Fcatfish.gif";

  useEffect(() => {
    const loadLiveAds = async () => {
      try {
        const [ad1, ad2] = await Promise.all([
          sanityAdsService.getAdByPosition('live_ads_banner_1'),
          sanityAdsService.getAdByPosition('live_ads_banner_2'),
        ]);
        
        console.log('Live Ads Debug:', {
          live_ads_banner_1: ad1,
          live_ads_banner_2: ad2
        });
        
        setLiveAd1(ad1);
        setLiveAd2(ad2);
      } catch (error) {
        console.error('Error loading live ads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveAds();
  }, []);

  const getOptimizedUrl = (ad: SanityAdvertisement | null, width: number) => {
    if (!ad) return fallbackImage;
    
    if (ad.mediaType === 'image' && ad.mediaImage) {
      return urlFor(ad.mediaImage)
        .width(width)
        .auto('format')
        .quality(85)
        .url();
    }
    
    return getAdMediaUrl(ad) || fallbackImage;
  };

  const getResponsiveUrls = (ad: SanityAdvertisement | null) => {
    return {
      sm: getOptimizedUrl(ad, 350),
      md: getOptimizedUrl(ad, 768),
      lg: getOptimizedUrl(ad, 1280),
    };
  };

  const renderBanner = (ad: SanityAdvertisement | null, position: 'top' | 'bottom') => {
    const urls = getResponsiveUrls(ad);
    const linkUrl = ad?.linkUrl || "/";
    const altText = ad?.altText || ad?.title || `Live Banner ${position === 'top' ? '1' : '2'}`;

    if (loading) {
      return (
        <div className="relative overflow-hidden w-full h-[50px] md:h-[80px] lg:h-[100px] rounded-lg">
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-gray-500 text-sm">Đang tải...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden w-full h-[50px] md:h-[80px] lg:h-[100px] rounded-lg hover:shadow-lg transition-shadow duration-300">
        <Link href={linkUrl} aria-label={altText}>
          <div className="relative w-full h-full">
            <picture className="w-full h-full">
              <source media="(min-width: 1024px)" srcSet={urls.lg} />
              <source media="(min-width: 768px)" srcSet={urls.md} />
              <img
                src={urls.sm}
                alt={altText}
                className="object-contain rounded-md w-full h-full"
                loading={position === 'top' ? 'eager' : 'lazy'}
              />
            </picture>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="w-full py-1 md:py-2">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-32">
        {/* Live Ads Banners - Vertical Layout */}
        <div className="flex flex-col gap-2 w-full">
          {/* Live Ads Banner 1 - Top */}
          {renderBanner(liveAd1, 'top')}

          {/* Live Ads Banner 2 - Bottom - Hidden on sm and md */}
          <div className="hidden lg:block">
            {renderBanner(liveAd2, 'bottom')}
          </div>
        </div>
      </div>
    </div>
  );
}