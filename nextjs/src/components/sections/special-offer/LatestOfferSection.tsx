"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import LatestOfferCard from "@/components/ui/cards/LatestOfferCard";
import OfferDetailModal from "@/components/modals/OfferDetailModal";
import { getOffers, SanityOffer } from "@/services/sanityOffersService";
import { getOfferImageUrl } from "../../../utils/sanityOfferHelpers";

export default function LatestOfferSection() {
  const [offers, setOffers] = useState<SanityOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<SanityOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const offersData = await getOffers(6);
        setOffers(offersData);
      } catch (error) {
        console.error("Error loading offers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const handleOfferClick = (offer: SanityOffer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  return (
    <section className="w-full py-3 md:py-6 lg:py-7 relative overflow-hidden">

      {/* Content */}
      <div className="container mx-auto px-1 sm:px-2 md:px-6 lg:px-8 xl:px-32 relative z-10">
        {/* Combined Container - Header and Offers together */}
        <div className="relative bg-gradient-to-br from-red-700/40 to-red-700/60 rounded-lg md:rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-t-lg md:rounded-t-xl p-4 md:p-6 lg:p-8">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-500/30 to-yellow-400/20 rounded-t-lg md:rounded-t-xl animate-pulse"></div>
            
            {/* Sparkle effects */}
            <div className="absolute top-2 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute top-4 right-1/4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping animation-delay-300"></div>
            <div className="absolute bottom-3 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-700"></div>
            
            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              {/* Icon Left */}
              <div className="animate-bounce">
                <Gift className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-yellow-300 drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]" strokeWidth={2.5} />
              </div>
              
              {/* Title with multiple effects */}
              <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-extrabold relative inline-block group">
                {/* Glow effect behind text */}
                <span className="absolute inset-0 blur-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 opacity-60 animate-pulse"></span>
                
                {/* Main gradient text */}
                <span className="relative bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,255,0,0.5)] animate-shimmer bg-[length:200%_100%]">
                  ƯU ĐÃI MỚI NHẤT CHO BẠN
                </span>
                
                {/* Text shadow for depth */}
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent blur-sm opacity-50">
                  ƯU ĐÃI MỚI NHẤT CHO BẠN
                </span>
              </h2>
              
              {/* Icon Right */}
              <div className="animate-bounce animation-delay-300">
                <Gift className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-yellow-300 drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Offers Container */}
          <div className="relative p-1 sm:p-2 md:p-4 lg:p-6">
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-600/10 animate-pulse"></div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-br from-red-500/40 to-red-600"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-b-lg md:rounded-b-xl bg-gradient-to-r from-red-500/20 via-transparent to-red-600/20 blur-sm"></div>
          
            {/* Content with relative positioning */}
            <div className="relative z-10">
              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-full h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] bg-gray-300 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : offers.length > 0 ? (
                /* Offers Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  {offers.map((offer) => (
                    <LatestOfferCard
                      key={offer._id}
                      title={offer.title}
                      imageUrl={getOfferImageUrl(offer.imageUrl) || undefined}
                      onClick={() => handleOfferClick(offer)}
                    />
                  ))}
                </div>
              ) : (
                /* No Offers State */
                <div className="text-center py-8">
                  <p className="text-white/60 text-lg">Không có ưu đãi nào hiện tại</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Detail Modal */}
      <OfferDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        offer={selectedOffer}
      />
    </section>
  );
}
