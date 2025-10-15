import MarqueeBoxSection from '@/components/sections/MarqueeBoxSection';
import MatchResultSection from '@/components/sections/match-result/MatchResultSection';
import PageSEO from "@/components/seo/PageSEO";

export default function MatchResultsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Kết quả bóng đá mới nhất - VaoLuoiTV',
    description: 'Cập nhật kết quả bóng đá mới nhất, tỉ số trực tiếp các trận đấu. Xem kết quả Premier League, Champions League, World Cup.',
    url: 'https://vaoluoitv.com/match-result',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Kết quả bóng đá',
      itemListElement: []
    }
  };

  return (
    <>
      <PageSEO
        title="Kết quả bóng đá mới nhất - VaoLuoiTV"
        description="Cập nhật kết quả bóng đá mới nhất, tỉ số trực tiếp các trận đấu. Xem kết quả Premier League, Champions League, World Cup."
        keywords={[
          'kết quả bóng đá',
          'tỉ số bóng đá',
          'kết quả trực tiếp',
          'Premier League kết quả',
          'Champions League kết quả',
          'World Cup kết quả',
          'tỉ số trận đấu',
          'kết quả bóng đá hôm nay'
        ]}
        canonical="https://vaoluoitv.com/match-result"
        ogImage="https://vaoluoitv.com/og-results.jpg"
        structuredData={structuredData}
      />
      <div>
        <MarqueeBoxSection/>   
        <MatchResultSection />
      </div>
    </>
  );
}