# NRB Europe - Content Management Guide

Complete guide for managing news articles, videos, and multimedia content on your CNN-style news website.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Adding News Articles](#adding-news-articles)
3. [Adding Videos](#adding-videos)
4. [Managing Categories](#managing-categories)
5. [Breaking News](#breaking-news)
6. [Live Updates](#live-updates)
7. [Multilingual Content](#multilingual-content)
8. [SEO Best Practices](#seo-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing Sanity Studio

1. **Local Development:**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000/studio`

2. **Production:**
   Visit: `https://your-domain.com/studio`

3. **Login:**
   - Use your Sanity credentials
   - If first time, run: `npm run setup-admin` to create admin user

---

## Adding News Articles

### Step 1: Create New Article

1. Open Sanity Studio (`/studio`)
2. Click **"Posts"** in the sidebar
3. Click **"+ Create"** → **"Post"**

### Step 2: Fill in Article Details

#### **Basic Information**

**Title** (Required)
- Keep under 60 characters for SEO
- Make it compelling and newsworthy
- Example: "European Parliament Approves New Immigration Policy"

**Slug** (Auto-generated)
- URL-friendly version of title
- Edit if needed: `european-parliament-new-immigration-policy`
- **Important:** Once published, avoid changing slugs (breaks links)

**Excerpt** (Required)
- 150-160 characters summary
- Appears in article cards and meta descriptions
- Example: "The European Parliament has approved sweeping immigration reforms affecting millions of NRBs across the continent."

#### **Content**

**Body** (Rich Text Editor)
- Full article content
- Supports:
  - **Headings** (H2, H3, H4)
  - **Bold**, *Italic*, ~~Strikethrough~~
  - Links
  - Quotes
  - Lists (bullet and numbered)
  - Images (inline)
  - Videos (embed)
  - Code blocks

**Writing Tips:**
- Use H2 for main sections
- Break content into scannable paragraphs (3-4 lines max)
- Add images every 2-3 paragraphs
- Include relevant links to sources

#### **Media**

**Main Image** (Featured Image)
- Click **"Upload"** or drag & drop
- Recommended: **1200x800px** (3:2 ratio)
- Formats: JPG, PNG, WebP
- Max size: 5MB
- Add **Alt Text** for accessibility (describe the image)

**Example Alt Text:**
> "Members of European Parliament voting on immigration reform bill in Brussels chamber"

#### **Categorization**

**Categories** (Select one or more)
- World
- Politics
- Business
- Technology
- Sports
- Entertainment
- Health
- Travel
- Lifestyle
- Science
- Opinion
- Local News

**Tags** (Optional)
- Add relevant keywords
- Example: immigration, EU policy, refugees, citizenship

**Region** (Optional)
- Specify European region if applicable
- Western Europe, Eastern Europe, Northern Europe, Southern Europe, etc.

#### **Author & Date**

**Author** (Required)
- Select from existing authors or create new
- To add author: Go to **Authors** → **+ Create**

**Published At** (Auto-set to now)
- Edit to schedule for future publication
- Format: YYYY-MM-DD HH:MM

#### **Special Flags**

**Is Live** ☑️
- Check for real-time developing stories
- Shows red "LIVE" badge on cards
- Updates automatically

**Is Breaking** ☑️
- Check for urgent breaking news
- Appears in Breaking News ticker
- Shows "BREAKING" badge

**Is Featured** ☑️
- Check to feature on homepage hero section
- Only latest featured article shows in hero

#### **SEO Settings** (Advanced)

**Meta Title** (Optional)
- Overrides default title for search engines
- Max 60 characters
- Default: Uses article title

**Meta Description** (Optional)
- Overrides excerpt for search results
- Max 160 characters
- Default: Uses excerpt

**Keywords** (Optional)
- Comma-separated SEO keywords
- Example: "immigration, EU, policy, NRB, Europe"

### Step 3: Preview & Publish

1. **Preview:** Click **"👁️ Preview"** (top right) to see draft
2. **Save Draft:** Click **"Save"** (keeps unpublished)
3. **Publish:** Click **"Publish"** (makes live on website)

**Note:** Content appears on website within 60 seconds due to ISR (Incremental Static Regeneration).

---

## Adding Videos

### Method 1: YouTube/Vimeo Embed (Recommended)

#### In Article Body:

1. Write content in Body field
2. Place cursor where video should appear
3. Click **"Insert"** → **"Object"** → **"Video Embed"**
4. Paste video URL:
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`
5. Video auto-embeds with responsive player

#### As Featured Video:

1. In article editor, scroll to **"Video URL"** field
2. Paste YouTube or Vimeo URL
3. Video appears at top of article (above content)

### Method 2: Direct Video Upload

**For self-hosted videos:**

1. Go to **"Media"** in Sanity Studio
2. Click **"Upload"** → Select video file
3. Supported formats: MP4, WebM, OGG
4. Max size: 100MB (consider hosting on YouTube/Vimeo for larger files)
5. Copy the generated URL
6. In article body, use video embed:

```markdown
<video controls>
  <source src="YOUR_VIDEO_URL" type="video/mp4">
</video>
```

### Video Best Practices

✅ **DO:**
- Use YouTube/Vimeo for videos > 50MB
- Add captions/subtitles for accessibility
- Include descriptive title and thumbnail
- Test on mobile devices
- Use 16:9 aspect ratio (1920x1080, 1280x720)

❌ **DON'T:**
- Upload raw, uncompressed videos
- Auto-play videos (annoying for users)
- Forget to set video privacy settings on YouTube
- Use proprietary codecs

### Creating Video Articles

For video-focused news:

1. **Title:** Prefix with 📹 or include "Video:"
   - Example: "Video: Inside Europe's Largest Refugee Camp"

2. **Main Image:** Use compelling video thumbnail
   - Add play button overlay in image editor

3. **Video URL:** Add YouTube/Vimeo link

4. **Body:** Include:
   - Video transcript (great for SEO & accessibility)
   - Key timestamps
   - Related links and sources

5. **Categories:** Consider adding "Video" tag

---

## Managing Categories

### Viewing Categories

1. Go to **"Categories"** in Sanity Studio
2. See all existing categories

### Adding New Category

1. Click **"+ Create"** → **"Category"**
2. Fill in:
   - **Title:** Category name (e.g., "Immigration")
   - **Slug:** URL version (e.g., "immigration")
   - **Description:** Brief description for category page
   - **Color:** Select brand color for category badge
3. **Publish**

### Assigning Categories to Articles

1. Edit article
2. In **"Categories"** field, click **"+ Add"**
3. Search and select category
4. Can add multiple categories (recommend max 2-3)
5. First category determines color badge

### Category Colors

Current categories and colors:
- **World** → Blue
- **Politics** → Red
- **Business** → Green
- **Technology** → Purple
- **Sports** → Orange
- **Entertainment** → Pink

---

## Breaking News

### What is Breaking News?

Breaking news appears in:
- Red ticker bar at top of every page
- Rotates through recent breaking stories
- Gets "BREAKING" badge on article cards

### Adding Breaking News

1. Create or edit article
2. Scroll to **"Is Breaking"** field
3. Check ☑️ the checkbox
4. **Publish**
5. Article appears in breaking news ticker within 10 seconds

### Breaking News Webhook (Auto-update)

Breaking news auto-refreshes via webhook:

**Webhook URL:** `https://your-domain.com/api/webhooks/breaking-news`

**Trigger:** Any article with `isBreaking = true` is published/updated

**What happens:**
1. Webhook pings your API
2. Breaking news cache refreshes
3. Ticker updates across all pages
4. No page reload needed

### Best Practices

✅ **Use breaking news for:**
- Major political events
- Emergency situations
- Significant policy changes
- Time-sensitive developments

❌ **Don't use for:**
- Opinion pieces
- Old news (> 24 hours)
- Minor updates
- Scheduled events

**Remove breaking status** after 24-48 hours:
1. Edit article
2. Uncheck "Is Breaking"
3. Update/Publish

---

## Live Updates

### What are Live Updates?

Live articles show:
- Pulsing red "LIVE" badge
- Real-time content updates
- Fixed "LIVE" indicator (bottom-right corner)

Perfect for:
- Elections
- Breaking developments
- Live events
- Press conferences
- Sports matches

### Creating Live Article

1. Create new article
2. Check ☑️ **"Is Live"** checkbox
3. Publish article
4. Article shows LIVE badge

### Updating Live Content

**Method 1: Edit Existing Content**
1. Open live article in Studio
2. Edit body content (add updates at TOP)
3. Add timestamp: `**[12:45 PM]** Update: ...`
4. Click **"Save"** or **"Update"**
5. Changes appear on site within 60 seconds

**Method 2: Live Update Blocks** (Advanced)

Structure updates chronologically:

```markdown
## Latest Updates

**[2:45 PM]** Prime Minister concludes speech. Parliament to vote at 3 PM.

**[2:30 PM]** Opposition leader raises concerns about immigration quotas.

**[2:15 PM]** Debate begins in European Parliament chamber.

**[2:00 PM]** Session opens. 450 members present.
```

### Ending Live Coverage

1. Edit article
2. Uncheck "Is Live"
3. Add final update:
   ```markdown
   **[FINAL UPDATE - 5:00 PM]** Coverage concluded. Parliament approved...
   ```
4. Update/Publish

---

## Multilingual Content

Your site supports **5 languages:**
- 🇬🇧 English (en)
- 🇧🇩 Bengali (bn)
- 🇪🇸 Spanish (es)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)

### Adding Translations

#### Option 1: Localized Fields (Recommended)

Some fields support direct translation:

1. Edit article
2. Click language tabs (EN, BN, ES, DE, FR)
3. Fill in content for each language
4. All translations in one document

#### Option 2: Separate Documents

Create separate article per language:

1. Create article in English
2. Publish
3. Duplicate article (click **"•••"** → **"Duplicate"**)
4. Edit duplicated article:
   - Change title to translated version
   - Update slug: `original-title-es` (add language suffix)
   - Translate all content
   - Add language tag (e.g., "Spanish")
5. Publish

### Translation Best Practices

✅ **DO:**
- Translate SEO fields (meta title, description)
- Keep URLs language-specific: `/en/news/article` vs `/es/noticias/articulo`
- Use native speakers for quality
- Translate image alt text
- Maintain same categories across languages

❌ **DON'T:**
- Use Google Translate alone (review manually)
- Mix languages in same article
- Forget to translate image captions
- Change article meaning between languages

### Language Switcher

Users can switch languages via:
- Header language selector (top-right)
- Automatically detects browser language
- Preserves user preference in localStorage

---

## SEO Best Practices

### Title Optimization

**Good titles:**
✅ "European Parliament Approves Major Immigration Reform"
✅ "UK Post-Brexit Trade Deal: What NRBs Need to Know"
✅ "Germany Announces €500M Fund for Refugee Integration"

**Bad titles:**
❌ "News Update" (too vague)
❌ "OMG! You Won't Believe What Happened Today!!!" (clickbait)
❌ "Article about politics and stuff in Europe" (rambling)

### Meta Description

**Formula:** [Action] + [Benefit] + [Specificity]

**Examples:**
✅ "The European Parliament has passed sweeping immigration reforms affecting over 2 million NRBs. Here's what changes from January 2026."

✅ "Germany announces €500 million integration fund for refugees. Find out if you qualify and how to apply for assistance."

### Image Optimization

**Alt Text Format:**
`[What] [Where] [Context]`

**Examples:**
- "European Parliament members voting in Brussels chamber during immigration reform session"
- "German Chancellor Angela Schulz signing refugee integration fund bill"
- "Group of NRB entrepreneurs at Berlin tech startup conference"

### URL Structure

**Good:**
✅ `/en/news/european-parliament-immigration-reform-2026`
✅ `/es/noticias/parlamento-europeo-reforma-migracion-2026`

**Bad:**
❌ `/news/article-123456`
❌ `/post?id=abc&cat=politics`
❌ `/en/news/european-parliament-approves-major-comprehensive-immigration-reform-bill-affecting-millions`

### Internal Linking

Add 3-5 internal links per article:
- Link to related articles
- Link to category pages
- Link to author profiles
- Link to relevant resources

**Example:**
> "This follows last month's [business visa reform](/en/news/eu-business-visa-reform) and supports the broader [European integration strategy](/en/news/eu-integration-strategy-2026)."

---

## Troubleshooting

### Common Issues

#### 1. **404 Error - Article Not Found**

**Problem:** Article shows 404 error

**Solutions:**
- ✅ Ensure article is **Published** (not draft)
- ✅ Check slug doesn't have special characters
- ✅ Wait 60 seconds after publishing (ISR revalidation)
- ✅ Clear browser cache (Ctrl+Shift+R)
- ✅ Verify correct URL format: `/[lang]/news/[slug]`

#### 2. **Image Not Loading**

**Problem:** Images show broken or don't appear

**Solutions:**
- ✅ Verify image uploaded to Sanity (check Media library)
- ✅ Check file size (< 5MB)
- ✅ Ensure correct image format (JPG, PNG, WebP)
- ✅ Add image URL to `next.config.js` domains:
  ```javascript
  images: {
    domains: ['cdn.sanity.io', 'your-project.sanity.io'],
  }
  ```

#### 3. **Video Not Playing**

**Problem:** Embedded video doesn't work

**Solutions:**
- ✅ Check video URL is public (not private)
- ✅ YouTube: Make sure video isn't age-restricted
- ✅ Use embed URL format:
  - YouTube: `https://www.youtube.com/embed/VIDEO_ID`
  - Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
- ✅ Test video URL in incognito mode

#### 4. **Breaking News Not Updating**

**Problem:** Breaking news ticker doesn't show new article

**Solutions:**
- ✅ Verify "Is Breaking" checkbox is checked
- ✅ Article must be published (not draft)
- ✅ Wait 10-15 seconds for webhook to trigger
- ✅ Check webhook logs: `/api/webhooks/breaking-news`
- ✅ Manually trigger: Unpublish → Re-publish article

#### 5. **Search Not Finding Articles**

**Problem:** Article doesn't appear in search results

**Solutions:**
- ✅ Article must be published
- ✅ Wait 60 seconds for index to update
- ✅ Check search terms match title or excerpt
- ✅ Verify article has content in body field
- ✅ Search is case-insensitive but needs 2+ characters

#### 6. **Categories Not Showing**

**Problem:** Category pages empty or not working

**Solutions:**
- ✅ Verify category exists in Sanity (Categories section)
- ✅ Check category is assigned to published articles
- ✅ Ensure category slug matches URL
- ✅ Wait 60 seconds after publishing articles

#### 7. **Multilingual Content Issues**

**Problem:** Wrong language showing or translations missing

**Solutions:**
- ✅ Check language selector in header
- ✅ Verify translations exist for that language
- ✅ Clear browser cache and localStorage
- ✅ Check URL includes correct language code: `/en/`, `/es/`, `/de/`

---

## Quick Reference

### Article Checklist ✅

Before publishing any article:

- [ ] Compelling title (< 60 characters)
- [ ] Unique slug (URL-friendly)
- [ ] Excerpt (150-160 characters)
- [ ] Full body content (min 300 words)
- [ ] Featured image (1200x800px, alt text)
- [ ] At least 1 category assigned
- [ ] Author selected
- [ ] Published date set
- [ ] SEO fields filled (meta title, description)
- [ ] Proofread for grammar/spelling
- [ ] Preview looks good on mobile
- [ ] Internal links added (3-5)
- [ ] Images have alt text
- [ ] Videos tested and playing

### Keyboard Shortcuts

**In Sanity Studio:**
- `Cmd/Ctrl + S` → Save draft
- `Cmd/Ctrl + Enter` → Publish
- `Cmd/Ctrl + K` → Quick search
- `Esc` → Close dialog
- `Cmd/Ctrl + Z` → Undo
- `Cmd/Ctrl + Shift + Z` → Redo

### Important URLs

- **Studio:** `/studio`
- **Homepage:** `/en`
- **Category:** `/en/category/[slug]`
- **Article:** `/en/news/[slug]`
- **Search:** `/search?q=[query]`
- **Author:** `/en/author/[slug]`

---

## Support & Resources

### Need Help?

1. **Check this guide** for common solutions
2. **Sanity Documentation:** https://www.sanity.io/docs
3. **Next.js Documentation:** https://nextjs.org/docs
4. **Contact Support:** admin@nrbeurope.com

### Additional Features

Your site also includes:
- ✅ PWA (Progressive Web App) - installable
- ✅ Push notifications for breaking news
- ✅ RSS feed: `/rss.xml`
- ✅ News sitemap: `/news-sitemap.xml`
- ✅ AMP pages: `/[lang]/news/[slug]/amp`
- ✅ Social sharing buttons
- ✅ Reading time estimates
- ✅ Related articles suggestions
- ✅ Newsletter subscription

---

**Last Updated:** February 1, 2026  
**Version:** 1.0  
**Website:** NRB Europe News
