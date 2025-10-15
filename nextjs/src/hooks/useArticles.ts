'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, ArticlesResponse, Hashtag, ArticlesQueryParams } from '@/types/article';
import { articleService } from '@/services/articleService';

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  fetchArticles: (params?: ArticlesQueryParams) => Promise<void>;
  refreshArticles: () => Promise<void>;
}

export function useArticles(initialParams?: ArticlesQueryParams): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null>(null);
  const [currentParams, setCurrentParams] = useState<ArticlesQueryParams | undefined>(initialParams);

  const fetchArticles = useCallback(async (params?: ArticlesQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ArticlesResponse = await articleService.getArticles(params);
      setArticles(response.data);
      setPagination(response.meta.pagination);
      setCurrentParams(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshArticles = useCallback(async () => {
    if (currentParams) {
      await fetchArticles(currentParams);
    }
  }, [currentParams, fetchArticles]);

  // Remove automatic fetch to prevent infinite loops
  // Let components call fetchArticles manually when needed

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    refreshArticles,
  };
}

interface UseFeaturedArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  fetchFeaturedArticles: (pageSize?: number) => Promise<void>;
}

export function useFeaturedArticles(pageSize: number = 5): UseFeaturedArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedArticles = useCallback(async (size: number = pageSize) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ArticlesResponse = await articleService.getFeaturedArticles(size);
      setArticles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải bài viết nổi bật');
      console.error('Error fetching featured articles:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchFeaturedArticles();
  }, [fetchFeaturedArticles]);

  return {
    articles,
    loading,
    error,
    fetchFeaturedArticles,
  };
}

interface UseArticleDetailReturn {
  article: Article | null;
  loading: boolean;
  error: string | null;
  fetchArticle: (slug: string) => Promise<void>;
}

export function useArticleDetail(): UseArticleDetailReturn {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const articleData: Article | null = await articleService.getArticleBySlug(slug);
      if (articleData) {
        setArticle(articleData);
      } else {
        setError('Bài viết không tồn tại');
        setArticle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải bài viết');
      console.error('Error fetching article:', err);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    article,
    loading,
    error,
    fetchArticle,
  };
}

interface UseHashtagsReturn {
  hashtags: Hashtag[];
  loading: boolean;
  error: string | null;
  fetchHashtags: () => Promise<void>;
}

interface UseRelatedArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  fetchRelatedArticles: (currentArticleId: string, hashtags: string[]) => Promise<void>;
}

export function useHashtags(): UseHashtagsReturn {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHashtags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hashtagsData: Hashtag[] = await articleService.getHashtags();
      setHashtags(hashtagsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải hashtags');
      console.error('Error fetching hashtags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);

  return {
    hashtags,
    loading,
    error,
    fetchHashtags,
  };
}

export function useRelatedArticles(): UseRelatedArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedArticles = useCallback(async (currentArticleId: string, hashtags: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await articleService.getRelatedArticles(currentArticleId, hashtags, 4);
      setArticles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải bài viết liên quan');
      console.error('Error fetching related articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    fetchRelatedArticles,
  };
}
