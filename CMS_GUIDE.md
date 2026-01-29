# NRB Europe CMS Guide

## 🚀 Quick Start

### Access Sanity Studio
1. Start the development server: `npm run dev`
2. Visit: http://localhost:3000/studio
3. Login with your Sanity account

### Create Your First Article

1. **Create an Author**
   - Go to "Author" in the sidebar
   - Click "Create new"
   - Fill in: Name, upload image, write bio
   - Click "Generate" next to Slug
   - Publish

2. **Create Categories**
   - Go to "Category" 
   - Create categories like:
     - Europe (red)
     - Immigration (blue)
     - Jobs (green)
     - Politics (purple)
     - Business (orange)
     - Lifestyle (gray)
   - Generate slug for each
   - Publish all

3. **Create an Article**
   - Go to "Article" (formerly Post)
   - Fill in:
     - Headline (required)
     - Generate slug
     - Excerpt (short summary)
     - Select Author
     - Select Categories
     - Upload Featured Image
     - Write article body
     - Set Published At date
     - Toggle "Breaking News" or "Featured" if needed
   - Add SEO settings (optional but recommended)
   - Publish

## 📝 Schema Overview

### Article Fields
- **Headline**: Main title (max 120 chars)
- **Slug**: URL-friendly version
- **Excerpt**: Summary for cards (max 200 chars)
- **Author**: Reference to author
- **Categories**: One or more categories
- **Featured Image**: Main article image with caption
- **Body**: Rich text content
- **Published At**: Publication date/time
- **Breaking News**: Toggle for breaking news badge
- **Featured**: Show on homepage hero
- **SEO**: SEO title, description, keywords, OG image

### Author Fields
- **Name**: Author name
- **Slug**: URL slug
- **Image**: Profile photo
- **Bio**: Author biography
- **Twitter**: Twitter handle (without @)
- **LinkedIn**: LinkedIn profile URL
- **Email**: Contact email

### Category Fields
- **Title**: Category name
- **Slug**: URL slug
- **Description**: Category description
- **Badge Color**: Color for category badges

## 🔄 How It Works

1. **Content is created in Sanity Studio** (http://localhost:3000/studio)
2. **Next.js fetches content** using the Sanity client
3. **Articles display on your website** at http://localhost:3000

## 📂 File Structure

```
src/
├── app/
│   ├── [lang]/
│   │   └── page.tsx          # Fetches articles
│   └── studio/               # Sanity Studio
├── sanity/
│   ├── schemaTypes/
│   │   ├── postType.ts       # Article schema
│   │   ├── authorType.ts     # Author schema
│   │   ├── categoryType.ts   # Category schema
│   │   └── seoType.ts        # SEO schema
│   └── env.ts                # Sanity config
└── lib/
    └── sanity/
        ├── client.ts         # Sanity client
        └── queries.ts        # GROQ queries
```

## 🔑 Environment Variables

Your `.env.local` file contains:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=3vvbog83
NEXT_PUBLIC_SANITY_DATASET=production
```

## 🌐 Deployment

When deploying to Vercel:
1. Add environment variables in Vercel dashboard
2. Deploy your Next.js app
3. Studio will be available at: https://yoursite.com/studio

## 📚 Useful Queries

All queries are in `src/lib/sanity/queries.ts`:
- `allArticlesQuery` - All articles
- `articleBySlugQuery` - Single article
- `featuredArticlesQuery` - Featured articles
- `breakingNewsQuery` - Breaking news
- `allCategoriesQuery` - All categories
- `articlesByCategoryQuery` - Articles by category

## 🎨 Customizing Schemas

To modify schemas, edit files in `src/sanity/schemaTypes/`
After changes, restart the dev server to see updates in Studio.

## 📖 Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Next.js + Sanity](https://www.sanity.io/docs/nextjs)
