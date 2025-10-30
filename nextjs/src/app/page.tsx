import MatchSection from "@/components/sections/home/MatchSection";
import AboutUsSection from "@/components/sections/home/AboutUsSection";
import MarqueeBoxSection from "@/components/sections/MarqueeBoxSection";
import PageSEO from "@/components/seo/PageSEO";
import SanityAdsBanner from "@/components/sections/home/SanityAdsBanner";
import SanityHeroSection from "@/components/sections/home/SanityHeroSection";

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VaoLuoiTV',
    url: 'https://vaoluoitv.com',
    description: 'Xem trực tiếp các trận đấu bóng đá hấp dẫn nhất, cập nhật tin tức và kết quả bóng đá mới nhất',
    publisher: {
      '@type': 'Organization',
      name: 'VaoLuoiTV',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vaoluoitv.com/logo.png'
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vaoluoitv.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };  

  
  console.log("Home page rendered");
  return (
    <>
      <PageSEO
        title="VaoLuoiTV - Xem trực tiếp bóng đá miễn phí"
        description="Xem trực tiếp các trận đấu bóng đá hấp dẫn nhất, cập nhật tin tức và kết quả bóng đá mới nhất. Chất lượng HD, không lag, hoàn toàn miễn phí."
        keywords={[
          'xem bóng đá trực tiếp',
          'vaoluoitv',
          'bóng đá miễn phí',
          'trực tiếp bóng đá',
          'xem bóng đá online',
          'bóng đá HD',
          'Premier League',
          'Champions League',
          'World Cup'
        ]}
        canonical="https://vaoluoitv.com"
        ogImage="https://vaoluoitv.com/og-home.jpg"
        structuredData={structuredData}
      />
      <main className="min-h-screen">
        {/* Home Container với responsive spacing */}
        <div className="w-full overflow-x-hidden">

          {/* Marquee Box Section */}
          <MarqueeBoxSection />

          {/* Title Section */}
          <SanityHeroSection />
          
          {/* Sanity Ads Banner */}
          <SanityAdsBanner />

          {/* Match Section */}
          <MatchSection />

          {/* About Us Section */}
          <AboutUsSection />

        </div>
      </main>
    </>
  );
}
