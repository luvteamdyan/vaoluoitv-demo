import NewsSection from '@/components/sections/news-page/NewsSection';
import PageSEO from "@/components/seo/PageSEO";

export default function NewsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tin tức bóng đá mới nhất - VaoLuoiTV',
    description: 'Tin tức bóng đá mới nhất, cập nhật liên tục. Phân tích, bình luận, dự đoán kết quả các trận đấu bóng đá hot nhất.',
    url: 'https://vaoluoitv.com/news',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Tin tức bóng đá',
      itemListElement: []
    }
  };

  return (
    <>
      <PageSEO
        title="Tin tức bóng đá mới nhất - VaoLuoiTV"
        description="Tin tức bóng đá mới nhất, cập nhật liên tục. Phân tích, bình luận, dự đoán kết quả các trận đấu bóng đá hot nhất."
        keywords={[
          'tin tức bóng đá',
          'bóng đá mới nhất',
          'tin thể thao',
          'phân tích bóng đá',
          'bình luận bóng đá',
          'dự đoán bóng đá',
          'tin tức Premier League',
          'tin tức Champions League'
        ]}
        canonical="https://vaoluoitv.com/news"
        ogImage="https://vaoluoitv.com/og-news.jpg"
        structuredData={structuredData}
      />
      <main className="bg-transparent">
        <div className="w-full overflow-x-hidden">
          <NewsSection />
        </div>
      </main>
    </>
  );
}