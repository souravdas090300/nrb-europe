import { Metadata } from 'next';
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, TWITTER_HANDLE } from './constants';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
}

/**
 * Generate comprehensive metadata for SEO
 */
export function generateSEOMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords,
  noindex = false,
  nofollow = false,
  canonicalUrl,
}: SEOProps): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDescription = description || SITE_DESCRIPTION;
  const pageImage = image || `${BASE_URL}/og-image.png`;
  const pageUrl = url || BASE_URL;
  const canonical = canonicalUrl || pageUrl;

  // Robots configuration - simplified for type compatibility
  const robotsConfig: Metadata['robots'] = noindex || nofollow 
    ? { index: !noindex, follow: !nofollow }
    : { index: true, follow: true };

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords || [
      'NRB Europe',
      'Bangladesh news',
      'Europe news',
      'immigration',
      'community',
      'politics',
      'business',
    ],
    robots: robotsConfig,
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: author || SITE_NAME,
    publisher: SITE_NAME,
    
    // Open Graph
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: 'en_GB',
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : [SITE_NAME],
        tags: keywords,
      }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    
    // Alternates
    alternates: {
      canonical,
      types: {
        'application/rss+xml': `${BASE_URL}/rss.xml`,
      },
    },
    
    // Additional metadata
    category: type === 'article' ? 'news' : undefined,
    classification: 'News & Media',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

/**
 * Extract keywords from article content
 */
export function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate article excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  const excerpt = plainText.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? excerpt.substring(0, lastSpace) + '...'
    : excerpt + '...';
}

/**
 * Validate and clean URL slug
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if content meets Google News requirements
 */
export function validateGoogleNewsArticle(article: {
  title: string;
  content: string;
  publishedAt?: string;
  author?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title validation
  if (!article.title || article.title.length < 10) {
    errors.push('Title must be at least 10 characters');
  }
  if (article.title && article.title.length > 110) {
    errors.push('Title should be under 110 characters for Google News');
  }

  // Content validation
  const wordCount = article.content.trim().split(/\s+/).length;
  if (wordCount < 80) {
    errors.push('Article must have at least 80 words for Google News');
  }

  // Date validation
  if (!article.publishedAt) {
    errors.push('Article must have a publication date');
  }

  // Author validation
  if (!article.author) {
    errors.push('Article must have a clear author attribution');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
