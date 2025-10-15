import { Article } from '@/types/article';

/**
 * Format date to Vietnamese format: dd/mm/yyyy hh:mm
 */
export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get best cover image URL from formats (prefer large > medium > small > thumbnail)
 */
export function getBestCoverImage(article: Article): { url: string; width?: number; height?: number } | null {
  if (!article.coverImage) return null;

  const formats = article.coverImage.formats;
  
  if (formats?.large) {
    return { url: formats.large.url, width: formats.large.width, height: formats.large.height };
  }
  if (formats?.medium) {
    return { url: formats.medium.url, width: formats.medium.width, height: formats.medium.height };
  }
  if (formats?.small) {
    return { url: formats.small.url, width: formats.small.width, height: formats.small.height };
  }
  if (formats?.thumbnail) {
    return { url: formats.thumbnail.url, width: formats.thumbnail.width, height: formats.thumbnail.height };
  }

  // Fallback to original URL
  return { url: article.coverImage.url };
}

/**
 * Get author info (name and picture)
 */
export function getAuthorInfo(article: Article): { name: string; pictureUrl?: string } {
  if (!article.author) {
    return { name: 'VaoLuoiTV' };
  }

  if (typeof article.author === 'string') {
    return { name: article.author };
  }

  const pictureUrl = article.author.picture?.formats?.small?.url 
    || article.author.picture?.formats?.thumbnail?.url 
    || article.author.picture?.url;

  return {
    name: article.author.name,
    pictureUrl
  };
}

/**
 * Check if article was updated after publish
 */
export function isArticleUpdated(article: Article): boolean {
  const published = new Date(article.publishedAt).getTime();
  const updated = new Date(article.updatedAt).getTime();
  
  // Consider updated if difference is more than 1 minute
  return (updated - published) > 60000;
}

/**
 * Check if content contains prediction keywords
 */
export function hasPredictionContent(content: unknown[]): boolean {
  const predictionKeywords = ['dự đoán', 'tỉ số', 'kèo', 'nhận định', 'soi kèo'];
  
  const contentText = JSON.stringify(content).toLowerCase();
  
  return predictionKeywords.some(keyword => contentText.includes(keyword));
}

/**
 * Get relative time (e.g., "2 giờ trước", "1 ngày trước")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return formatArticleDate(dateString);
  }
}

