'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleDetailSection from '@/components/sections/news-page/ArticleDetailSection';
import ArticleSEO from '@/components/seo/ArticleSEO';
import { useArticleDetail, useRelatedArticles } from '@/hooks/useArticles';
import { articleService } from '@/services/articleService';
import { NewsArticle } from '@/types/article';
import SkeletonNewsCard from '@/components/ui/cards/SkeletonNewsCard';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const { article, loading, fetchArticle } = useArticleDetail();
  const { articles: relatedArticlesFromAPI, fetchRelatedArticles } = useRelatedArticles();
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (!id) return;
    
    fetchArticle(id);
  }, [id, fetchArticle]);

  // Fetch related articles when main article loads
  useEffect(() => {
    if (article && article.id && article.title) {
      const articleHashtags = Array.isArray(article.hashtags) ? article.hashtags.map(tag => tag.hashtag) : [];
      
      if (articleHashtags.length > 0) {
        fetchRelatedArticles(article.slug || article.documentId || article.id?.toString() || '', articleHashtags);
      }
    }
  }, [article, fetchRelatedArticles]);

  // Convert API related articles to legacy format
  useEffect(() => {
    if (relatedArticlesFromAPI.length > 0) {
      const currentArticleSlug = article?.slug;
      const currentArticleId = article?.documentId || article?.id?.toString() || id;
      
      // Filter out current article
      const filtered = relatedArticlesFromAPI.filter(relatedArticle => {
        const relatedSlug = relatedArticle.slug;
        const relatedDocumentId = relatedArticle.documentId;
        const relatedId = relatedArticle.id?.toString();
        
        return (
          relatedSlug !== currentArticleSlug &&
          relatedSlug !== currentArticleId &&
          relatedDocumentId !== currentArticleId &&
          relatedId !== currentArticleId
        );
      });
      
      const converted = filtered.map(article => articleService.convertToLegacyFormat(article) as NewsArticle);
      setRelatedArticles(converted);
    }
  }, [relatedArticlesFromAPI, article, id]);
  
  // Show skeleton while loading or if no article yet
  if (loading || !article) {
    return (
      <main className="bg-transparent">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-32 pt-4 pb-2 md:pt-6 md:pb-4 lg:pt-8 lg:pb-6">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>

          {/* Image Skeleton */}
          <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="animate-pulse bg-gray-700 w-full h-64 md:h-80 lg:h-96 rounded-xl"></div>
          </div>

          {/* Content Skeleton */}
          <div className="w-full max-w-4xl mx-auto space-y-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>

          {/* Related Articles Skeleton */}
          <div className="mt-16">
            <div className="h-8 bg-gray-700 rounded mb-8 w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonNewsCard key={i} variant="small" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-transparent">
      <ArticleSEO article={article} />
      <div className="w-full overflow-x-hidden">
        <ArticleDetailSection 
          article={article} 
          relatedArticles={relatedArticles}
        />
      </div>
    </main>
  );
}
