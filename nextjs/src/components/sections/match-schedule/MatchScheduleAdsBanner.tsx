"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { sanityAdsService } from "@/services/sanityAdsService";
import { getAdMediaUrl } from "@/utils/sanityAdHelpers";
import type { SanityAdvertisement } from "@/types/sanity-ads";

interface MatchScheduleAdsBannerProps {
  className?: string;
}

export default function MatchScheduleAdsBanner({ 
  className = ""
}: MatchScheduleAdsBannerProps) {
  const [matchScheduleAd, setMatchScheduleAd] = useState<SanityAdvertisement | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback video URL
  const fallbackVideoUrl = "";

  useEffect(() => {
    const loadMatchScheduleAd = async () => {
      try {
        const ad = await sanityAdsService.getAdByPosition('match_schedule_banner');
        setMatchScheduleAd(ad);
      } catch (error) {
        console.error('Error loading match schedule ad:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchScheduleAd();
  }, []);

  const renderMedia = (ad: SanityAdvertisement) => {
    const mediaUrl = getAdMediaUrl(ad);
    
    if (ad.mediaType === 'video' && mediaUrl) {
      const isGif = mediaUrl.toLowerCase().includes('.gif');
      
      if (isGif) {
        return (
          <Image
            src={mediaUrl}
            alt={ad.altText || ad.title}
            width={1024}
            height={200}
            className="object-fill rounded-lg"
            style={{ width: '100%', height: '100%' }}
            sizes="(max-width: 640px) 360px, (max-width: 768px) 640px, (max-width: 1024px) 768px, 1024px"
          />
        );
      } else {
        return (
          <video
            src={mediaUrl}
            className="object-fill rounded-lg"
            style={{ width: '100%', height: '100%' }}
            autoPlay
            muted
            loop
            playsInline
          />
        );
      }
    } else if (mediaUrl) {
      return (
        <Image
          src={mediaUrl}
          alt={ad.altText || ad.title}
          width={1024}
          height={200}
          className="object-fill rounded-lg"
          style={{ width: '100%', height: '100%' }}
          sizes="(max-width: 640px) 360px, (max-width: 768px) 640px, (max-width: 1024px) 768px, 1024px"
        />
      );
    }
    return null;
  };

  return (
    <section className={`w-full py-2 md:py-3 ${className}`}>
      <div className="w-full container mx-auto px-2 md:px-6 lg:px-8 xl:px-32">
        {/* Match Schedule Banner - Fixed height, fill without crop */}
        <div className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg w-full h-[50px] md:h-[100px] lg:h-[150px]">
          {loading ? (
            <div className="w-full h-full animate-pulse rounded-lg flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">Đang tải...</span>
            </div>
          ) : matchScheduleAd ? (
            <Link 
              href={matchScheduleAd.linkUrl || "/match-schedule"} 
              className="block w-full h-full"
              aria-label={matchScheduleAd.altText || matchScheduleAd.title}
            >
              {renderMedia(matchScheduleAd)}
            </Link>
          ) : (
            <Link 
              href="/match-schedule" 
              className="block w-full h-full"
              aria-label="Xem lịch thi đấu bóng đá"
            >
              <video
                src={fallbackVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="object-fill rounded-lg"
                style={{ width: '100%', height: '100%' }}
              >
                Your browser does not support the video tag.
              </video>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
