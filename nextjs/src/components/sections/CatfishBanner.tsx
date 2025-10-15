"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { sanityAdsService } from "@/services/sanityAdsService";
import { getAdMediaUrl } from "@/utils/sanityAdHelpers";
import type { SanityAdvertisement } from "@/types/sanity-ads";
import { urlFor } from "@/lib/sanity";

export default function CatfishBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [catfishAd, setCatfishAd] = useState<SanityAdvertisement | null>(null);
  const [catfishAd2, setCatfishAd2] = useState<SanityAdvertisement | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback image
  const fallbackImage = "https://cdn.vaoluoitv.com/images/catfishfallback.gif";

  useEffect(() => {
    const loadCatfishAds = async () => {
      try {
        const ad1 = await sanityAdsService.getAdByPosition('catfish_banner');
        setCatfishAd(ad1);
        
        try {
          const ad2 = await sanityAdsService.getAdByPosition('catfish_banner_2');
          setCatfishAd2(ad2);
        } catch {
          setCatfishAd2(null);
        }
      } catch (error) {
        console.error('Error loading catfish ads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCatfishAds();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;
  
  // Don't show anything while loading
  if (loading) {
    return null;
  }

  const getOptimizedUrl = (ad: SanityAdvertisement | null, isLg: boolean = false) => {
    if (!ad) return fallbackImage;
    
    if (ad.mediaType === 'image' && ad.mediaImage) {
      const width = isLg ? 560 : 1280;
      return urlFor(ad.mediaImage)
        .width(width)
        .fit('max')
        .auto('format')
        .quality(90)
        .url();
    }
    
    return getAdMediaUrl(ad) || fallbackImage;
  };

  const mediaUrl = getOptimizedUrl(catfishAd);
  const mediaUrl2 = getOptimizedUrl(catfishAd2, true);
  const linkUrl = catfishAd?.linkUrl || "/";
  const linkUrl2 = catfishAd2?.linkUrl || "/";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="w-full md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-0">
        <div className="relative shadow-2xl overflow-hidden">
          {/* Nút đóng */}
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 z-10 bg-red-500 text-white w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
            aria-label="Đóng banner"
          >
            ×
          </button>

          <div className="flex flex-col lg:flex-row lg:gap-1">
            <div className="relative w-full lg:w-1/2">
              {catfishAd ? (
                <Link href={linkUrl} aria-label={catfishAd?.altText || "Xem chương trình khuyến mãi"}>
                  <div className="relative w-full h-full overflow-hidden">
                    {mediaUrl && (
                      mediaUrl.toLowerCase().includes('.gif') ? (
                        <img
                          src={mediaUrl}
                          alt={catfishAd?.altText || "Catfish Banner"}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                        />
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt={catfishAd?.altText || "Catfish Banner"}
                          width={1280}
                          height={100}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 95vw, 560px"
                          priority
                        />
                      )
                    )}
                  </div>
                </Link>
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <img
                    src={fallbackImage}
                    alt="Fallback Banner"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {catfishAd2 && (
              <div className="hidden lg:block relative w-1/2">
                <Link href={linkUrl2} aria-label={catfishAd2?.altText || "Xem chương trình khuyến mãi"}>
                  <div className="relative w-full h-full overflow-hidden">
                    {mediaUrl2 && (
                      mediaUrl2.toLowerCase().includes('.gif') ? (
                        <img
                          src={mediaUrl2}
                          alt={catfishAd2?.altText || "Catfish Banner 2"}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                        />
                      ) : (
                        <Image
                          src={mediaUrl2}
                          alt={catfishAd2?.altText || "Catfish Banner 2"}
                          width={560}
                          height={120}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                          sizes="560px"
                        />
                      )
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
