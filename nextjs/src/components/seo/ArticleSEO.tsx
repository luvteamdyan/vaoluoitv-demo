'use client';

import Head from 'next/head';
import { Article } from '@/types/article';
import { getBestCoverImage, getAuthorInfo } from '@/utils/articleHelpers';

interface ArticleSEOProps {
  article: Article;
}

export default function ArticleSEO({ article }: ArticleSEOProps) {
  const coverImage = getBestCoverImage(article);
  const author = getAuthorInfo(article);
  
  // Get site URL from env or use window.location in browser
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (typeof window !== 'undefined' ? window.location.origin : 'https://vaoluoitv.com');
  
  const articleUrl = `${siteUrl}/news/${article.slug || article.documentId}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{article.title} | VaoLuoiTV</title>
      <meta name="description" content={article.excerpt || article.title} />
      <meta name="keywords" content={article.hashtags?.map(tag => tag.hashtag).join(', ')} />
      <meta name="author" content={author.name} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={articleUrl} />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={article.excerpt || article.title} />
      {coverImage && <meta property="og:image" content={coverImage.url} />}
      <meta property="og:site_name" content="VaoLuoiTV" />
      <meta property="article:published_time" content={article.publishedAt} />
      <meta property="article:modified_time" content={article.updatedAt} />
      <meta property="article:author" content={author.name} />
      {article.hashtags?.map(tag => (
        <meta key={tag.id} property="article:tag" content={tag.hashtag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={articleUrl} />
      <meta name="twitter:title" content={article.title} />
      <meta name="twitter:description" content={article.excerpt || article.title} />
      {coverImage && <meta name="twitter:image" content={coverImage.url} />}

      {/* Canonical URL */}
      <link rel="canonical" href={articleUrl} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.excerpt,
            image: coverImage?.url,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: {
              '@type': 'Person',
              name: author.name,
              ...(author.pictureUrl && { image: author.pictureUrl })
            },
            publisher: {
              '@type': 'Organization',
              name: 'VaoLuoiTV',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.ico`
              }
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': articleUrl
            }
          })
        }}
      />
    </Head>
  );
}

