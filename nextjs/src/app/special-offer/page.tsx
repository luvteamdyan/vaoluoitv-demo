'use client';

import LatestOfferSection from "@/components/sections/special-offer/LatestOfferSection";
import InvestorSection from "@/components/sections/special-offer/InvestorSection";
import MarqueeBoxSection from "@/components/sections/MarqueeBoxSection";


const SpecialOfferPage = () => {
  return (
    <div>
      {/* Marquee Box Section */}
      <MarqueeBoxSection />
      {/* Special Offer Section */}
      <LatestOfferSection />
      {/* Investor Section */}
      <InvestorSection />
    </div>
  );
};

export default SpecialOfferPage;