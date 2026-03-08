/**
 * @file articleQueries.ts — GROQ queries for fetching articles from Sanity
 *
 * All queries target the "post" document type and include projections
 * tailored for specific UI views (homepage cards, hero, detail page, etc.).
 *
 * Queries are defined as template literals so they can be passed directly
 * to `sanityClient.fetch(query, params)` or used with `sanityFetch`.
 *
 * @see {@link src/sanity/schemaTypes/postType.ts} for the full schema
 */

/**
 * Latest 10 articles for the homepage feed.
 * Includes image, excerpt, author, category, and breaking/featured flags.
 */
export const latestArticlesQuery = `
  *[_type == "post"] | order(publishedAt desc)[0...10] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    excerpt,
    isBreaking,
    isFeatured,
    category->{
      title,
      slug,
      color
    },
    author->{
      name,
      image
    }
  }
`

/**
 * Top 3 featured articles for the homepage hero section.
 * Only returns articles where `isFeatured == true`.
 */
export const featuredArticlesQuery = `
  *[_type == "post" && isFeatured == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    category->{
      title,
      slug,
      color
    },
    author->{
      name
    }
  }
`

/**
 * Latest 10 breaking news items for the ticker/banner.
 * Minimal projection (title + slug + date) for fast rendering.
 */
export const breakingNewsQuery = `
  *[_type == "post" && isBreaking == true] | order(publishedAt desc)[0...10] {
    _id,
    title,
    slug,
    publishedAt
  }
`

/**
 * Full article detail by slug.
 * Includes rich body content, expanded author/category references,
 * image metadata (caption, attribution), and SEO overrides.
 *
 * @param $slug - The article’s `slug.current` value
 */
export const articleBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    mainImage {
      ...,
      caption,
      attribution
    },
    publishedAt,
    isBreaking,
    isFeatured,
    categories[]-> {
      title,
      slug,
      color
    },
    author-> {
      name,
      image,
      bio,
      twitter,
      linkedin
    },
    seo
  }
`
