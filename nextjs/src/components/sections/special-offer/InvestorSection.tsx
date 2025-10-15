"use client";

import { useState, useEffect, useRef } from "react";
import { sanityContentService } from "@/services/sanityContentService";
import { mergeInvestorContent, getInvestorVideoUrl } from "@/utils/sanityContentHelpers";
import type { SanityInvestorContent } from "@/types/sanity-content";

export default function InvestorSection() {
  const [investorContent, setInvestorContent] = useState<SanityInvestorContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Mặc định là mở tiếng (false = không mute)
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadInvestorContent = async () => {
      try {
        const data = await sanityContentService.getInvestorContent();
        const mergedData = mergeInvestorContent(data);
        setInvestorContent(mergedData);
      } catch (error) {
        console.error('Error loading investor content:', error);
        // Use default data as fallback
        const defaultData = mergeInvestorContent(null);
        setInvestorContent(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadInvestorContent();
  }, []);

  // Function to toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  return (
    <section className="w-full py-3 md:py-6 lg:py-8">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 xl:px-32">
        {/* Main Content Container */}
        <div className="bg-gradient-to-br from-red-700/40 to-red-700 rounded-xl md:rounded-xl border-t-6 shadow-xl p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            
            {/* Left Column - Investor Introduction */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              {/* Title */}
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
                {investorContent?.sectionTitle || 'Giới thiệu về nhà đầu tư'}
              </h2>
              
              {/* Description */}
              <div className="text-sm md:text-base text-gray-300 leading-relaxed">
                {/* Full text for md and lg screens */}
                <p className="hidden sm:block">
                  {investorContent?.description || 'Khám phá câu chuyện và tầm nhìn của nhà đầu tư chính đằng sau nền tảng bóng đá trực tiếp hàng đầu. Với kinh nghiệm dày dặn trong lĩnh vực thể thao và công nghệ, chúng tôi cam kết mang đến những trải nghiệm xem bóng đá tuyệt vời nhất cho người hâm mộ.'}
                </p>
                
                {/* Truncated text for sm screens only */}
                <div className="sm:hidden">
                  <p className={isExpanded ? "" : "line-clamp-3"}>
                    {investorContent?.description || 'Khám phá câu chuyện và tầm nhìn của nhà đầu tư chính đằng sau nền tảng bóng đá trực tiếp hàng đầu. Với kinh nghiệm dày dặn trong lĩnh vực thể thao và công nghệ, chúng tôi cam kết mang đến những trải nghiệm xem bóng đá tuyệt vời nhất cho người hâm mộ.'}
                  </p>
                  
                  {/* Toggle button for sm screens only */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
                  >
                    {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                  </button>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="pt-2">
                <button 
                  onClick={() => investorContent?.ctaLink && window.open(investorContent.ctaLink, '_blank')}
                  className="flex items-center px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-red-600 text-white shadow-lg shadow-red-600/25"
                >
                  {investorContent?.ctaText || 'Tìm hiểu thêm'}
                </button>
              </div>
            </div>

            {/* Right Column - Video Player */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900">
                {loading ? (
                  <div className="w-full h-full animate-pulse rounded-lg flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">Đang tải video...</span>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      preload="auto"
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      controls={false}
                    >
                      <source 
                        src={investorContent ? getInvestorVideoUrl(investorContent) : ''} 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Mute/Unmute Button */}
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 text-white"
                      aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                    >
                      {isMuted ? (
                        // Muted icon (speaker with X)
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        // Unmuted icon (speaker)
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.896-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
