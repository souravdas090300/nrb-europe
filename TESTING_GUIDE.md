# Testing Guide for NRB Europe Website

## Testing Checklist

### 1. Sanity Studio Testing
- [ ] Navigate to http://localhost:3000/studio
- [ ] Verify Sanity Studio loads properly
- [ ] Create a test author:
  - Name: Test Author
  - Slug: test-author
  - Add bio and image (optional)
  - Publish the author

- [ ] Create a test category:
  - Title: Test Category
  - Slug: test-category
  - Select a color badge (e.g., red)
  - Publish the category

- [ ] Create a test article:
  - Title: "Test Breaking News Article"
  - Slug: test-breaking-news
  - Excerpt: Short description
  - Check "Breaking News" checkbox
  - Check "Featured" checkbox
  - Select the test category created above
  - Select the test author
  - Add body content using rich text editor
  - Upload a featured image
  - Fill SEO fields (title, description, keywords)
  - Set published date to today
  - Publish the article

### 2. Homepage Testing
- [ ] Navigate to http://localhost:3000
- [ ] Verify articles are displayed in a grid layout
- [ ] Check that ArticleCard shows:
  - Featured image
  - Category badge (red background)
  - "BREAKING" badge for breaking news articles
  - Article title
  - Excerpt
  - Author name
  - Published date
- [ ] Click on an article card
- [ ] Verify navigation to article detail page

### 3. Article Detail Page Testing
- [ ] Navigate to an article: http://localhost:3000/article/[slug]
- [ ] Verify the page displays:
  - Article title
  - Featured image with caption/attribution
  - Published date and author
  - Category badges
  - Full article body with Portable Text rendering
  - Related articles section at bottom
  - Social sharing buttons (Facebook, Twitter, LinkedIn)
  - "Back to Homepage" link

- [ ] View page source (Ctrl+U)
- [ ] Verify meta tags are present:
  ```html
  <title>Article Title | NRB Europe</title>
  <meta name="description" content="...">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:image" content="...">
  <meta name="twitter:card" content="summary_large_image">
  ```

- [ ] Verify JSON-LD structured data is present:
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "...",
    "datePublished": "...",
    ...
  }
  </script>
  ```

### 4. 404 Page Testing
- [ ] Navigate to http://localhost:3000/article/non-existent-slug
- [ ] Verify custom 404 page displays:
  - "Article Not Found" heading
  - Error message
  - "Back to Homepage" button
  - Styled with red accent

### 5. Multi-Language Testing
- [ ] Click the language switcher in the header
- [ ] Switch to different languages (Bengali, Spanish, German, French)
- [ ] Verify:
  - URL updates with language prefix (e.g., /bn, /es, /de, /fr)
  - Header, footer, and navigation text translates
  - Article content remains in original language
  - Language preference is saved in cookie

### 6. SEO and Sitemap Testing
- [ ] Navigate to http://localhost:3000/sitemap.xml
- [ ] Verify sitemap displays with:
  - Homepage URL
  - All article URLs
  - All category URLs
  - Proper lastModified dates
  - Priority and changeFrequency values

- [ ] Navigate to http://localhost:3000/news-sitemap.xml
- [ ] Verify news sitemap shows:
  - Only articles from last 2 days
  - Proper structure for Google News

- [ ] Navigate to http://localhost:3000/robots.txt
- [ ] Verify robots.txt contains:
  - Allow: /
  - Disallow: /studio/, /api/
  - Sitemap references

### 7. Image Optimization Testing
- [ ] Verify all images load properly
- [ ] Check that Sanity CDN images are optimized
- [ ] Test responsive images on different screen sizes
- [ ] Verify fallback images work for articles without images

### 8. Responsive Design Testing
Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Verify:
- [ ] Grid layout adjusts properly (3 cols → 2 cols → 1 col)
- [ ] Navigation is accessible on mobile
- [ ] Images scale correctly
- [ ] Text is readable on all screen sizes

### 9. Performance Testing
- [ ] Open Chrome DevTools → Lighthouse
- [ ] Run Lighthouse audit
- [ ] Check scores for:
  - Performance: Should be > 90
  - Accessibility: Should be > 90
  - Best Practices: Should be > 90
  - SEO: Should be 100

### 10. Console Error Checking
- [ ] Open browser console (F12)
- [ ] Navigate through the site
- [ ] Verify no JavaScript errors
- [ ] Check for any React hydration errors
- [ ] Verify no 404 errors for resources

## Common Issues and Solutions

### Issue: Images not loading from Sanity
**Solution**: Verify `cdn.sanity.io` is added to `next.config.mjs` remotePatterns

### Issue: Articles not showing on homepage
**Solution**: 
- Check Sanity Studio at /studio
- Verify articles are published (not drafts)
- Check GROQ query in queries.ts

### Issue: 404 page not showing
**Solution**: 
- Verify not-found.tsx file exists
- Check that slug parameter is correct in URL

### Issue: Meta tags not appearing
**Solution**:
- Check generateMetadata function in article/[slug]/page.tsx
- Verify SEO fields are filled in Sanity

### Issue: Language switcher not working
**Solution**:
- Check middleware.ts is configured correctly
- Verify NEXT_LOCALE cookie is being set
- Check i18n-config.ts has all locales

## Test Data Examples

### Sample Article Data
```json
{
  "title": "Immigration Policy Changes in Germany 2024",
  "slug": "immigration-policy-germany-2024",
  "excerpt": "New immigration policies affect thousands of NRBs across Germany.",
  "isBreaking": true,
  "isFeatured": true,
  "category": "Immigration",
  "author": "John Doe",
  "publishedAt": "2024-01-15T10:00:00.000Z",
  "body": [
    {
      "children": [
        {
          "text": "Germany has announced significant changes to its immigration policies..."
        }
      ]
    }
  ]
}
```

## Deployment Checklist

Before deploying to production:
- [ ] Update `baseUrl` in sitemap.ts and news-sitemap.ts to production URL
- [ ] Update Twitter handle in layout.tsx metadata
- [ ] Add Google verification code in layout.tsx
- [ ] Update og-image.jpg and twitter-image.jpg in public folder
- [ ] Set up environment variables for Sanity (if needed)
- [ ] Test build: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Configure CDN caching for images
- [ ] Set up SSL certificate
- [ ] Configure custom domain
- [ ] Submit sitemap to Google Search Console
- [ ] Submit news sitemap to Google News Publisher Center

## Next Steps

After testing is complete:
1. Create actual content in Sanity Studio
2. Add more categories and authors
3. Publish real articles
4. Set up analytics (Google Analytics, Plausible, etc.)
5. Configure email newsletter integration
6. Add search functionality
7. Implement commenting system
8. Set up automated social media sharing
9. Add RSS feed
10. Configure PWA features
