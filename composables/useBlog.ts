import type { BlogPost, BlogPostListItem } from '~/types/blog';
import type { Author } from '~/types/author';
import { useContentService } from './content/useContentService';

/**
 * Composable for blog-related functionality
 */
export const useBlog = () => {
  const { locale } = useI18n();
  const contentService = useContentService('nuxtContent');

  /**
   * Fetch a blog post by slug
   * @param slug The slug of the blog post
   * @returns Async data with the blog post
   */
  const fetchBlogPost = async (slug: string) => {
    return await useLocalizedContent<BlogPost>('blog', { slug });
  };

  /**
   * Fetch all blog posts
   * @param limit Optional limit for the number of posts to fetch
   * @returns Async data with the blog posts
   */
  const fetchBlogPosts = async (limit?: number) => {
    const { data, pending, error, refresh } = await useAsyncData<BlogPostListItem[]>(
      `blog-posts-${locale.value}-${limit}`,
      async () => {
        const collectionName = `blog_${locale.value}`;
        const allPosts = await contentService.queryAll<BlogPostListItem>(collectionName);

        // Sort by publication date (newest first)
        const sortedPosts = allPosts.sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        // Apply limit if specified
        if (limit) {
          return sortedPosts.slice(0, limit);
        }

        return sortedPosts;
      }
    );

    return { data, pending, error, refresh };
  };

  /**
   * Fetch the featured (most recent) blog post
   * @returns Async data with the featured blog post
   */
  const fetchFeaturedBlogPost = async () => {
    const { data, pending, error, refresh } = await useAsyncData<BlogPostListItem>(
      `featured-blog-post-${locale.value}`,
      async () => {
        const collectionName = `blog_${locale.value}`;
        const allPosts = await contentService.queryAll<BlogPostListItem>(collectionName);

        // Sort by publication date (newest first) and get the first one
        const sortedPosts = allPosts.sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );

        return sortedPosts[0] || null;
      }
    );

    return { data, pending, error, refresh };
  };

  /**
   * Fetch blog posts by author
   * @param authorNamespace The namespace of the author
   * @param authorKey The key of the author
   * @returns Async data with the blog posts
   */
  const fetchBlogPostsByAuthor = async (authorNamespace: string, authorKey: string) => {
    const { data, pending, error, refresh } = await useAsyncData<BlogPostListItem[]>(
      `blog-posts-by-author-${locale.value}-${authorNamespace}-${authorKey}`,
      async () => {
        const collectionName = `blog_${locale.value}`;
        const allPosts = await contentService.queryAll<BlogPostListItem>(collectionName);

        // Filter posts by author
        const authorPosts = allPosts.filter(post => 
          post.author && 
          post.author.namespace === authorNamespace && 
          post.author.key === authorKey
        );

        // Sort by publication date (newest first)
        return authorPosts.sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
      }
    );

    return { data, pending, error, refresh };
  };

  /**
   * Calculate the estimated reading time for a blog post
   * @param content The content of the blog post
   * @returns The estimated reading time in minutes
   */
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  /**
   * Format a date for display
   * @param date The date to format
   * @returns The formatted date string
   */
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    fetchBlogPost,
    fetchBlogPosts,
    fetchFeaturedBlogPost,
    fetchBlogPostsByAuthor,
    calculateReadingTime,
    formatDate
  };
};
