export interface Article {
  id: number;
  documentId: string;
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: RichTextBlock[] | unknown[]; // Rich Text content - flexible for API data
  featured: boolean;
  author?: string | {
    name: string;
    picture?: {
      url: string;
      formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
      };
    };
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  coverVideo?: {
    id: number;
    url: string;
    mime?: string;
    ext?: string;
    width?: number;
    height?: number;
  };
  coverImage?: {
    id: number;
    url: string;
    formats?: {
      large?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      small?: { url: string; width: number; height: number };
      thumbnail?: { url: string; width: number; height: number };
    };
  };
  hashtags: Array<{
    id: number;
    hashtag: string;
    slug: string;
  }>;
}

// Rich Text Block Types
export interface RichTextBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'quote';
  level?: number; // for heading
  format?: 'ordered' | 'unordered'; // for list
  children?: Array<{
    type?: 'text' | 'link';
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    url?: string;
  }>;
  image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export interface ArticlesResponse {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Hashtag {
  id: number;
  hashtag: string;
  slug: string;
}

export interface ArticlesQueryParams {
  page?: number;
  pageSize?: number;
  featured?: boolean;
  tag?: string;
  type?: 'article' | 'video';
  sort?: string;
}

// Legacy interface để tương thích với code cũ
export interface NewsArticle {
  id: string;
  picture: string;
  title: string;
  subTitle: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
  isFeatured?: boolean;
  isVideo?: boolean;
  videoUrl?: string;
}
