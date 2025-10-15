// app/match-schedule/page.tsx
import MatchScheduleSection from "@/components/sections/match-schedule/MatchScheduleSection";
import MatchScheduleAdsBanner from "@/components/sections/match-schedule/MatchScheduleAdsBanner";
import MarqueeBoxSection from "@/components/sections/MarqueeBoxSection";
import PageSEO from "@/components/seo/PageSEO";

export default function SchedulePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Lịch thi đấu bóng đá hôm nay - VaoLuoiTV',
    description: 'Xem lịch thi đấu bóng đá hôm nay, ngày mai và tuần tới. Cập nhật lịch trực tiếp các giải đấu Premier League, La Liga, Serie A, Bundesliga.',
    url: 'https://vaoluoitv.com/match-schedule',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Lịch thi đấu bóng đá',
      itemListElement: []
    }
  };

  return (
    <>
      <PageSEO
        title="Lịch thi đấu bóng đá hôm nay - VaoLuoiTV"
        description="Xem lịch thi đấu bóng đá hôm nay, ngày mai và tuần tới. Cập nhật lịch trực tiếp các giải đấu Premier League, La Liga, Serie A, Bundesliga."
        keywords={[
          'lịch thi đấu bóng đá',
          'lịch bóng đá hôm nay',
          'lịch trực tiếp bóng đá',
          'Premier League',
          'La Liga',
          'Serie A',
          'Bundesliga',
          'Champions League',
          'lịch thi đấu tuần tới'
        ]}
        canonical="https://vaoluoitv.com/match-schedule"
        ogImage="https://vaoluoitv.com/og-schedule.jpg"
        structuredData={structuredData}
      />
      <div>
        <MarqueeBoxSection />
        {/* Ads Banner Section */}
        <MatchScheduleAdsBanner />
        {/* Match Schedule Section */}
        <MatchScheduleSection />
      </div>
    </>
  );
}
