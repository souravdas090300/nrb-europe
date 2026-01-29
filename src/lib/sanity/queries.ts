// Fetch all articles
export const allArticlesQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  isBreaking,
  isFeatured,
  "category": categories[0]->title,
  "categorySlug": categories[0]->slug.current,
  "categoryColor": categories[0]->color,
  "author": author->name,
  "authorImage": author->image,
  "authorSlug": author->slug.current
}`

// Fetch single article by slug
export const articleBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  body,
  mainImage,
  publishedAt,
  isBreaking,
  isFeatured,
  "categories": categories[]->{ title, slug, color },
  "author": author->{
    name,
    slug,
    image,
    bio,
    twitter,
    linkedin,
    email
  },
  seo
}`

// Fetch featured articles
export const featuredArticlesQuery = `*[_type == "post" && isFeatured == true] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  "category": categories[0]->title,
  "categoryColor": categories[0]->color,
  "author": author->name
}`

// Fetch breaking news
export const breakingNewsQuery = `*[_type == "post" && isBreaking == true] | order(publishedAt desc)[0...5] {
  _id,
  title,
  slug,
  publishedAt
}`

// Fetch all categories
export const allCategoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  description,
  color,
  "postCount": count(*[_type == "post" && references(^._id)])
}`

// Fetch articles by category
export const articlesByCategoryQuery = `*[_type == "post" && $categoryId in categories[]._ref] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  "category": categories[0]->title,
  "author": author->name,
  "authorImage": author->image
}`

// Fetch all authors
export const allAuthorsQuery = `*[_type == "author"] | order(name asc) {
  _id,
  name,
  slug,
  image,
  bio,
  "postCount": count(*[_type == "post" && references(^._id)])
}`
