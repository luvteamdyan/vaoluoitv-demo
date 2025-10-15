'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import AllNewsCard from '@/components/ui/cards/AllNewsCard';
import RichTextRenderer from '@/components/ui/RichTextRenderer';
import VideoPlayer from '@/components/videos/VideoPlayer';
import ImagePopup from '@/components/ui/ImagePopup';
import {
  formatArticleDate,
  getBestCoverImage,
  getAuthorInfo,
  hasPredictionContent,
} from '@/utils/articleHelpers';
import { NewsArticle } from '@/types/article';

interface ArticleDetailSectionProps {
  article: Article;
  relatedArticles?: NewsArticle[];
}

export default function ArticleDetailSection({ article, relatedArticles = [] }: ArticleDetailSectionProps) {
  const [imagePopup, setImagePopup] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: ''
  });

  const coverImage = getBestCoverImage(article);
  const author = getAuthorInfo(article);
  const showPrediction = hasPredictionContent(article.content);
  const isVideo = article.type === 'video' && article.coverVideo;

  const openImagePopup = (src: string, alt: string) => {
    setImagePopup({ isOpen: true, src, alt });
  };

  const closeImagePopup = () => {
    setImagePopup({ isOpen: false, src: '', alt: '' });
  };

  return (
    <section className="w-full py-3 md:py-6 lg:py-8">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 xl:px-32">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/news/all"
            className="inline-flex items-center gap-2 text-sm md:text-base text-gray-400 hover:text-yellow-400 transition-colors duration-300"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Tất cả tin tức</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          {/* Title with Video Badge */}
          <div className="flex items-start gap-3 mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight flex-1">
              {article.title}
            </h1>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg md:text-xl text-gray-400 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info & Hashtags on same line */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Author - Date Time */}
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-400">
              <span className="text-white font-medium">{author.name}</span>
              <span>-</span>
              <span>{formatArticleDate(article.publishedAt)}</span>
            </div>

            {/* Right: Hashtags */}
            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {article.hashtags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/news/all?tag=${tag.slug}`}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                  >
                    #{tag.hashtag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cover Media - Video or Image */}
        {isVideo ? (
          <div className="w-full mb-8">
            <VideoPlayer
              videoUrl={(article.coverVideo as { url: string })?.url}
              posterUrl={coverImage?.url}
              title={article.title}
            />
          </div>
        ) : coverImage ? (
          <div className="w-full mb-8">
            <div
              className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
              style={{
                aspectRatio: coverImage.width && coverImage.height
                  ? `${coverImage.width}/${coverImage.height}`
                  : '16/9'
              }}
              onClick={() => openImagePopup(coverImage.url, article.title)}
            >
              <Image
                src={coverImage.url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              {/* Gradient overlay for better text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Click indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Prediction Block */}
        {showPrediction && (
          <div className="w-full mb-8 p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Dự Đoán Tỉ Số</h3>
                <p className="text-sm text-gray-400">Phân tích và nhận định từ chuyên gia</p>
              </div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
              <p className="text-gray-300 text-sm">
                💡 Bài viết này có chứa dự đoán và phân tích kỹ thuật. Vui lòng đọc kỹ nội dung bên dưới.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full mb-8">
          <div className="bg-gray-900 p-6 md:p-8 rounded-xl border border-white/10">
            <RichTextRenderer content={article.content} />
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 mb-12">
            <div className="mb-8">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Tin tức liên quan
                  </h2>
                </div>

                {/* View All News Button */}
                <Link
                  href="/news/all"
                  className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50 hover:border-yellow-400 whitespace-nowrap"
                >
                  <span>Xem tất cả tin tức</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedArticles.slice(0, 3).map((relatedArticle) => (
                <div key={relatedArticle.id} className="col-span-1">
                  <AllNewsCard article={relatedArticle} variant="small" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Popup */}
        <ImagePopup
          isOpen={imagePopup.isOpen}
          src={imagePopup.src}
          alt={imagePopup.alt}
          onClose={closeImagePopup}
        />
      </div>
    </section>
  );
}
