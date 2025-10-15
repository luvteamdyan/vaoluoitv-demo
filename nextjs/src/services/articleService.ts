import { Article, ArticlesResponse, Hashtag, ArticlesQueryParams } from '@/types/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_NEWS_API || 'https://luck8event.com/api';

class ArticleService {
  private async fetchFromAPI<T>(endpoint: string, params?: Record<string, unknown>, retryCount = 0): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'force-cache',
        next: { revalidate: 300 }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from API:', error);
      
      if (error instanceof Error && error.name === 'AbortError' && retryCount < 2) {
        console.warn(`Request timeout, retrying... (attempt ${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchFromAPI<T>(endpoint, params, retryCount + 1);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API phản hồi quá chậm. Vui lòng thử lại sau.');
      }
      throw error;
    }
  }

  private isArticlePublished(article: Article): boolean {
    if (!article.slug || !article.title || !article.publishedAt) {
      return false;
    }

    const publishDate = new Date(article.publishedAt);
    const now = new Date();
    
    return publishDate <= now;
  }

  // ✅ Optimized getArticles - Chỉ lấy fields cần thiết cho LIST
  async getArticles(params?: ArticlesQueryParams): Promise<ArticlesResponse> {
    try {
        // ✅ Tối ưu field selection - chỉ lấy fields cần thiết cho LIST view
        const optimizedParams: Record<string, unknown> = {
          ...params,
          // Chỉ lấy fields cần thiết (KHÔNG lấy content!)
          'fields[0]': 'title',
          'fields[1]': 'slug', 
          'fields[2]': 'excerpt',
          'fields[3]': 'publishedAt',
          'fields[4]': 'type',
          'fields[5]': 'featured',
          'fields[6]': 'author',
          // Populate coverImage - chỉ lấy URL chính và thumbnail
          'populate[coverImage][fields][0]': 'url',
          'populate[coverImage][fields][1]': 'alternativeText',
          'populate[coverImage][populate][formats][fields][0]': 'url',
          // Populate hashtags - chỉ lấy hashtag name
          'populate[hashtags][fields][0]': 'hashtag',
          // KHÔNG populate content, coverVideo cho list view
        };
        
        const response = await this.fetchFromAPI<unknown>('/articles', optimizedParams);
      
      if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
        const articlesResponse = response as ArticlesResponse;
        
        const publishedArticles = articlesResponse.data.filter(article => 
          this.isArticlePublished(article)
        );
        
        return {
          data: publishedArticles,
          meta: {
            ...articlesResponse.meta,
            pagination: {
              ...articlesResponse.meta.pagination,
              total: publishedArticles.length
            }
          }
        };
      } else if (Array.isArray(response)) {
        const articles = response as Article[];
        const publishedArticles = articles.filter(article => 
          this.isArticlePublished(article)
        );
        
        return {
          data: publishedArticles,
          meta: {
            pagination: {
              page: 1,
              pageSize: publishedArticles.length,
              pageCount: 1,
              total: publishedArticles.length
            }
          }
        };
      } else {
        console.warn('Unexpected articles response format:', response);
        return {
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: 0,
              pageCount: 0,
              total: 0
            }
          }
        };
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 0,
            pageCount: 0,
            total: 0
          }
        }
      };
    }
  }

  // ✅ Detail page - Lấy FULL data
  async getArticleBySlug(slug: string): Promise<Article> {
    try {
        // Không optimize, lấy tất cả fields cho detail page
        const response = await this.fetchFromAPI<unknown>(`/articles/${slug}`);
      
      let article: Article | null = null;
      
      if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown[] }).data) && (response as { data: unknown[] }).data.length > 0) {
        article = (response as { data: Article[] }).data[0];
      } else if (response && typeof response === 'object' && 'id' in response) {
        article = response as Article;
      }
      
      if (article && this.isArticlePublished(article)) {
        return article;
      }
      
      console.warn('Article not found, not published, or invalid:', slug);
      return null as unknown as Article;
      
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return null as unknown as Article;
    }
  }

  async getHashtags(): Promise<Hashtag[]> {
    try {
        const response = await this.fetchFromAPI<unknown>('/hashtags');
      if (Array.isArray(response)) {
        return response as Hashtag[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown[] }).data)) {
        return (response as { data: Hashtag[] }).data;
      } else {
        console.warn('Unexpected hashtags response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching hashtags:', error);
      return [];
    }
  }

  async getFeaturedArticles(pageSize: number = 5): Promise<ArticlesResponse> {
    return this.getArticles({
      featured: true,
      pageSize,
      sort: 'publishedAt:desc', // Sort by publishedAt descending (newest first)
    });
  }

  async getLatestArticles(pageSize: number = 10): Promise<ArticlesResponse> {
    return this.getArticles({
      pageSize,
      sort: 'publishedAt:desc', // Sort by publishedAt descending (newest first)
    });
  }

  async getArticlesByTag(tag: string, pageSize: number = 10): Promise<ArticlesResponse> {
    return this.getArticles({
      tag,
      pageSize,
    });
  }

  async getVideoArticles(pageSize: number = 5): Promise<ArticlesResponse> {
    return this.getArticles({
      type: 'video',
      pageSize,
    });
  }

  async getRelatedArticles(currentArticleId: string, hashtags: string[], pageSize: number = 4): Promise<ArticlesResponse> {
    try {
      if (hashtags.length > 0) {
        const tagString = hashtags.join(',');
        const response = await this.getArticles({
          tag: tagString,
          pageSize: pageSize + 1,
        });
        
        const filteredData = response.data.filter(article => {
          const articleDocumentId = article.documentId;
          const articleId = article.id?.toString();
          const articleSlug = article.slug;
          
          return (
            articleDocumentId !== currentArticleId &&
            articleId !== currentArticleId &&
            articleSlug !== currentArticleId
          );
        });
        
        return {
          ...response,
          data: filteredData.slice(0, pageSize)
        };
      }
      
      return this.getArticles({
        pageSize,
      });
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 0,
            pageCount: 0,
            total: 0
          }
        }
      };
    }
  }

  convertToLegacyFormat(article: Article): unknown {
    return {
      id: article.slug || article.documentId || article.id?.toString() || '',
      picture: article.coverImage?.url || 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: article.title || 'Không có tiêu đề',
      subTitle: article.excerpt || '',
      content: this.convertRichTextToHtml(article.content),
      category: Array.isArray(article.hashtags) && article.hashtags.length > 0 ? article.hashtags[0].hashtag : 'Tin tức',
      author: article.author || 'Admin',
      publishDate: article.publishedAt || new Date().toISOString(),
      isFeatured: article.featured || false,
      isVideo: article.type === 'video',
      videoUrl: article.coverVideo ? article.coverVideo.url : undefined,
    };
  }

  private convertRichTextToHtml(content: unknown[]): string {
    if (!Array.isArray(content)) return '';
    
    return content.map(block => {
      if ((block as { type?: string }).type === 'paragraph') {
        return `<p>${(block as { children?: unknown[] }).children?.map((child: unknown) => (child as { text?: string }).text || '').join('') || ''}</p>`;
      }
      if ((block as { type?: string }).type === 'heading') {
        const level = (block as { level?: number }).level || 1;
        return `<h${level}>${(block as { children?: unknown[] }).children?.map((child: unknown) => (child as { text?: string }).text || '').join('') || ''}</h${level}>`;
      }
      return '';
    }).join('');
  }
}

export const articleService = new ArticleService();
export default articleService;
