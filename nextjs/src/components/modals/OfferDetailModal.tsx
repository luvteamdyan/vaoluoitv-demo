"use client";

import {
  Info,
  FileText,
  X
} from "lucide-react";
import { useEffect } from "react";
import { type SanityOffer } from "@/services/sanityOffersService";
import { getOfferImageUrl } from "@/utils/sanityOfferHelpers";

interface OfferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: SanityOffer | null;
}

export default function OfferDetailModal({ isOpen, onClose, offer }: OfferDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div 
        className="relative rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 to-black p-0 sm:p-4 md:p-6 lg:p-8 border border-gray-600"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 sm:top-4 sm:right-4 z-20 text-white hover:text-red-400 transition-colors duration-300 p-2 sm:p-2 bg-black/50 rounded-full"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        {/* Fixed Header - Title + Image */}
        <div className="p-3 sm:p-2 md:p-3 border-b border-gray-600 pt-12 sm:pt-2">
          {offer.title && (
            <div className="text-center lg:text-left">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">
                {offer.title}
              </h3>
            </div>
          )}

          {/* Advertisement Image */}
          {offer.imageUrl && (
            <div className="w-full mb-1 sm:mb-2">
              <img
                src={getOfferImageUrl(offer.imageUrl) || ''}
                alt={offer.title || 'Offer image'}
                className="w-full h-auto object-cover rounded-lg shadow-lg max-h-[120px] sm:max-h-[150px] md:max-h-[200px]"
              />
            </div>
          )}
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-2 sm:pb-4 mt-2 sm:mt-4">
          <div className="flex flex-col">
            {/* Subtitle */}
            {offer.subtitle && offer.subtitle.trim() && (
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-600">
                <p className="text-xs sm:text-sm md:text-base font-medium text-white leading-relaxed">
                  {offer.subtitle}
                </p>
              </div>
            )}

            {/* Header Image */}
            {offer.headerImage && (
              <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-b border-gray-600">
                <div className="w-full">
                  <img
                    src={getOfferImageUrl(offer.headerImage) || ''}
                    alt={offer.title || 'Header image'}
                    className="w-full h-auto object-contain rounded-lg shadow-lg max-h-[200px] sm:max-h-[300px] md:max-h-[400px]"
                  />
                </div>
              </div>
            )}
            
            {/* Terms */}
            {offer.terms && offer.terms.length > 0 && (
              <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-b border-gray-600">
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                  Thể lệ
                </h4>
                <div className="space-y-2 sm:space-y-4">
                  {offer.terms.map((item, index) => {
                    if (item.type === 'text') {
                      return (
                        <div key={index} className="flex items-start gap-1 sm:gap-2">
                          <span className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full mt-1 flex-shrink-0"></span>
                          <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
                            {item.value}
                          </p>
                        </div>
                      );
                    } else if (item.type === 'image' && item.image) {
                      const imageUrl = getOfferImageUrl(item.image);
                      if (!imageUrl) return null;
                      return (
                        <div key={index} className="w-full my-2 sm:my-4">
                          <img 
                            src={imageUrl} 
                            alt={item.image.alt || "Term image"} 
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            {offer.content && offer.content.length > 0 && (
              <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-b border-gray-600">
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Điều kiện
                </h4>
                <div className="space-y-2 sm:space-y-4">
                  {offer.content.map((item, index) => {
                    if (item.type === 'text') {
                      return (
                        <div key={index} className="text-gray-300 leading-relaxed text-justify text-xs sm:text-sm md:text-base whitespace-pre-line">
                          {item.value}
                        </div>
                      );
                    } else if (item.type === 'image' && item.image) {
                      const imageUrl = getOfferImageUrl(item.image);
                      if (!imageUrl) return null;
                      return (
                        <div key={index} className="w-full my-2 sm:my-4">
                          <img 
                            src={imageUrl} 
                            alt={item.image.alt || "Content image"} 
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {offer.notes && offer.notes.length > 0 && (
              <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-gray-600">
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Các hội viên lưu ý
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {offer.notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-1 sm:gap-2">
                      <span className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full mt-1 flex-shrink-0"></span>
                      <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
