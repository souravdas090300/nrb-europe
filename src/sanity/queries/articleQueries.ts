import { groq } from 'next-sanity'

// Latest articles for homepage
export const latestArticlesQuery = groq`
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

// Featured articles
export const featuredArticlesQuery = groq`
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

// Breaking news
export const breakingNewsQuery = groq`
  *[_type == "post" && isBreaking == true] | order(publishedAt desc)[0...10] {
    _id,
    title,
    slug,
    publishedAt
  }
`

// Single article by slug
export const articleBySlugQuery = groq`
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
