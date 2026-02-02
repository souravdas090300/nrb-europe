# 📝 Step-by-Step Guide: Add Your First Article

Follow these exact steps to add articles, images, and videos to your NRB Europe website.

---

## 🚀 STEP 1: Access Sanity Studio

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open Sanity Studio in your browser:**
   ```
   http://localhost:3000/studio
   ```

3. **You should see:**
   - Left sidebar with menu items
   - Main content area
   - Login screen (if first time)

4. **If prompted to login:**
   - Click **"Sign in with Google"** or **"Sign in with GitHub"**
   - Or use Sanity credentials if you have them

---

## 📰 STEP 2: Create Your First Article

### 2.1 Navigate to Posts

1. Look at **left sidebar**
2. Click **"Posts"** (or "Articles")
3. You'll see list of existing posts (or empty if new)

### 2.2 Start New Post

1. Click **"+ Create"** button (top-right corner)
2. Select **"Post"** from dropdown
3. New article editor opens

---

## ✍️ STEP 3: Fill in Basic Information

### Title Field
```
Example: "European Parliament Approves New Immigration Policy"
```
- **What it is:** Your article headline
- **Where it shows:** Homepage cards, article page, search results
- **Tips:** 
  - Keep under 60 characters
  - Make it compelling
  - Use active voice

### Slug Field (Auto-generated)
```
Example: european-parliament-approves-new-immigration-policy
```
- **What it is:** URL-friendly version of title
- **Where it shows:** In the URL: `/en/news/european-parliament-...`
- **Tips:**
  - Usually auto-generated from title
  - Can edit if needed (before publishing)
  - Use lowercase, hyphens only
  - Once published, don't change (breaks links)

### Excerpt Field
```
Example: "The European Parliament has approved sweeping immigration reforms that will affect millions of NRBs across the continent. The new policy takes effect in January 2026."
```
- **What it is:** Short summary (150-160 chars)
- **Where it shows:** Under title on article cards, meta description
- **Tips:**
  - Hook readers in first sentence
  - Include key information
  - End with period

---

## 🖼️ STEP 4: Add Featured Image (Main Image)

### Finding the Image Field

1. Scroll down in the article editor
2. Look for **"Main Image"** section
3. You'll see empty image box with "Select" or "Upload" button

### Method 1: Upload Image from Computer

1. Click **"Upload"** button
2. Choose image from your computer
3. Recommended specs:
   - **Size:** 1200 x 800 pixels
   - **Format:** JPG or PNG
   - **File size:** Under 2MB
   - **Aspect ratio:** 3:2 (landscape)

4. **After upload:**
   - Image appears in preview
   - Click on image to edit

### Method 2: Use Existing Image

1. Click **"Select"** button
2. Browse uploaded images
3. Click image to select
4. Click **"Select"** to confirm

### Adding Alt Text (Important!)

1. After selecting/uploading image
2. Look for **"Alt text"** field (might need to expand)
3. **Example alt text:**
   ```
   European Parliament members voting in Brussels chamber
   ```
4. **Purpose:** 
   - Accessibility for screen readers
   - SEO ranking
   - Shows if image fails to load

5. **Tips for alt text:**
   - Describe what's in the image
   - Keep under 125 characters
   - Don't say "image of" (redundant)
   - Be specific: "Angela Merkel" not "politician"

### Editing Image (Optional)

1. Click **"Edit"** on uploaded image
2. You can:
   - Crop image
   - Adjust focus point (for responsive)
   - Add caption
3. Click **"Apply"** when done

---

## ✏️ STEP 5: Write Your Article Content

### Using the Body Editor

1. Scroll to **"Body"** field
2. You'll see rich text editor (like Word)

### Basic Formatting

**Add Headings:**
- Click **"H"** dropdown
- Select **"Heading 2"** for main sections
- Select **"Heading 3"** for subsections
- Example:
  ```
  ## Key Changes in the Policy    ← This is H2
  ### Immigration Quotas           ← This is H3
  Regular paragraph text here
  ```

**Bold and Italic:**
- Select text
- Click **"B"** for bold
- Click **"I"** for italic
- Or use shortcuts:
  - Bold: `Ctrl+B` (Windows) or `Cmd+B` (Mac)
  - Italic: `Ctrl+I` or `Cmd+I`

**Add Links:**
1. Select text to link
2. Click **"🔗"** icon
3. Paste URL
4. Click **"Apply"**

**Example:**
```
The new policy follows [last month's referendum](https://example.com/referendum) that showed...
```

**Lists:**
- Click **bullet list** icon for unordered list
- Click **numbered list** icon for ordered list
- Press Enter for new item
- Press Tab to indent (sub-item)

---

## 🎥 STEP 6: Add Videos to Your Article

### Method 1: YouTube Video (Easiest)

#### A. Get YouTube Video URL
1. Go to YouTube
2. Find your video
3. Click **"Share"** button
4. Copy URL: `https://www.youtube.com/watch?v=VIDEO_ID`

#### B. Add to Article Body
1. Place cursor where video should appear
2. Look for **"+"** button or **"Add block"**
3. Select **"YouTube"** or **"Video"** option
4. Paste URL
5. Video preview appears!

**Example:**
```
Your article text here...

[YouTube Video Embed - Auto-displays player]

More article text continues...
```

#### C. Video Settings (Optional)
- Click on video block
- Settings appear:
  - Start time
  - Autoplay (not recommended)
  - Show controls
  - Privacy mode

### Method 2: Add Video URL Field

1. Scroll to **"Video URL"** field (near top of editor)
2. Paste full YouTube or Vimeo URL:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. Video will appear at **top of article** (before body content)

### Method 3: Vimeo Video

Same as YouTube:
1. Get Vimeo URL: `https://vimeo.com/VIDEO_ID`
2. Add to Body or Video URL field
3. Works automatically!

### Method 4: Upload Video File (For Short Clips)

**⚠️ Only for videos under 50MB**

1. In Body editor, click **"+"** → **"File"** or **"Video"**
2. Upload video file:
   - **Formats:** MP4 (recommended), WebM, OGG
   - **Size:** Under 50MB
   - **Resolution:** 1920x1080 or 1280x720
3. Video player appears in article

**Pro Tip:** For larger videos, use YouTube or Vimeo - they're free and optimized!

---

## 🎬 STEP 7: Add Images Inside Article Body

### Insert Image Mid-Article

1. Place cursor where image should appear
2. Click **"+"** button or look for image icon
3. Click **"Image"** option
4. Upload new image or select existing
5. Image appears in content

### Image with Caption

1. After inserting image
2. Click on image
3. Look for **"Caption"** field
4. Type caption:
   ```
   European Parliament building in Brussels, Belgium
   ```
5. Caption appears below image on website

### Multiple Images (Gallery)

1. Insert multiple images in a row
2. They'll display as gallery
3. Or use special **"Gallery"** block if available

---

## 📂 STEP 8: Choose Categories

### Assign Category

1. Scroll to **"Categories"** field
2. Click **"+ Add item"**
3. Search for category:
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

4. Click to select
5. Category badge shows on article cards

### Add Multiple Categories

- Click **"+ Add item"** again
- Select second category
- Recommend max 2-3 categories

### Can't Find Category?

**Create new category:**
1. Go to **"Categories"** in sidebar
2. Click **"+ Create"**
3. Fill in:
   - **Title:** "Immigration" (example)
   - **Slug:** "immigration" (lowercase)
   - **Description:** "Immigration news and policy updates"
   - **Color:** Choose color for badge
4. Click **"Publish"**
5. Return to your article and select new category

---

## 👤 STEP 9: Select Author

### Choose Existing Author

1. Find **"Author"** field
2. Click dropdown
3. Select author name
4. Author byline appears on article

### Create New Author

If no authors exist:

1. Go to **"Authors"** in sidebar
2. Click **"+ Create"**
3. Fill in:
   - **Name:** "John Smith"
   - **Slug:** "john-smith"
   - **Bio:** Short description
   - **Image:** Upload author photo (300x300px square)
   - **Twitter:** @johnsmith (optional)
4. Click **"Publish"**
5. Return to article and select author

---

## 🚨 STEP 10: Special Settings (Optional)

### Breaking News ⚡

**When to use:** Urgent, time-sensitive news

1. Find **"Is Breaking"** checkbox
2. Check ☑️ the box
3. Article appears in red ticker at top of every page
4. Shows "BREAKING" badge on cards
5. **Remember:** Uncheck after 24-48 hours

### Live Updates 🔴

**When to use:** Developing story, live event

1. Find **"Is Live"** checkbox
2. Check ☑️ the box
3. Shows pulsing red "LIVE" badge
4. Fixed indicator appears bottom-right of pages
5. Update article anytime - refreshes in 60 seconds

### Featured Article ⭐

**When to use:** Most important story of the day

1. Find **"Is Featured"** checkbox
2. Check ☑️ the box
3. Article appears in large hero section on homepage
4. Only latest featured article shows in hero

---

## 🔍 STEP 11: SEO Settings (Optional but Recommended)

### Meta Title

1. Find **"SEO"** or **"Meta"** section (may need to expand)
2. **Meta Title** field (optional):
   ```
   European Parliament Immigration Reform 2026 | NRB Europe
   ```
3. **Purpose:** Shows in Google search results
4. **Default:** Uses article title if empty
5. **Tip:** Keep under 60 characters

### Meta Description

1. **Meta Description** field (optional):
   ```
   European Parliament approves major immigration reforms affecting 2 million NRBs. New policy includes work permits, family reunification, and citizenship pathways. Effective January 2026.
   ```
2. **Purpose:** Shows under title in Google
3. **Default:** Uses excerpt if empty
4. **Tip:** 150-160 characters, include main keyword

### Focus Keyword

1. **Keywords** field (optional):
   ```
   immigration, European Parliament, EU policy, work permit, NRB
   ```
2. Comma-separated keywords
3. Helps with SEO

---

## 👀 STEP 12: Preview Your Article

### Before Publishing

1. Look for **"👁️ Preview"** button (top-right)
2. Click to see draft preview
3. Check:
   - ✅ Title looks good
   - ✅ Images loading
   - ✅ Videos playing
   - ✅ Text formatted correctly
   - ✅ Links working
   - ✅ Categories showing
   - ✅ Looks good on mobile (resize browser)

### Make Edits

1. Go back to editor
2. Make changes
3. Preview again
4. Repeat until perfect

---

## 🚀 STEP 13: Publish Article

### First Time Publishing

1. Click **"Publish"** button (green, top-right)
2. Confirmation appears
3. Click **"Publish"** again to confirm
4. Success! 🎉

### Article is Now Live

1. Visit your homepage: `http://localhost:3000/en`
2. Wait **10-60 seconds** (cache refresh)
3. **Refresh page** (Ctrl+Shift+R)
4. See your article on homepage!

### View Published Article

1. In Studio, click **"Open"** button (next to Publish)
2. Opens article on website
3. Or manually go to:
   ```
   http://localhost:3000/en/news/your-article-slug
   ```

---

## 🔄 STEP 14: Update Published Article

### Edit Published Article

1. In Studio, click on published article
2. Make changes
3. Click **"Publish"** again (saves updates)
4. Changes appear on website in **60 seconds**

### Unpublish Article

1. Click **"•••"** menu (top-right)
2. Select **"Unpublish"**
3. Article removed from website
4. Saved as draft

---

## 📱 STEP 15: Check on Different Devices

### Desktop

1. Visit `http://localhost:3000/en`
2. Check:
   - Article appears on homepage
   - Images load
   - Videos play
   - Text readable

### Mobile

1. Open on phone or tablet
2. Or resize browser window to mobile size
3. Check:
   - Layout adapts
   - Touch-friendly
   - Images responsive
   - Videos work

### Browser Dev Tools

1. Press **F12** (Chrome/Firefox)
2. Click **📱 device icon** (toggle device toolbar)
3. Select device: iPhone, Android, iPad
4. Test article display

---

## 🎯 Quick Checklist

Before publishing, verify:

- [ ] **Title** - Clear and compelling (< 60 chars)
- [ ] **Slug** - URL-friendly, unique
- [ ] **Excerpt** - Summarizes article (150-160 chars)
- [ ] **Body** - Full content, well-formatted
- [ ] **Main Image** - 1200x800px, alt text added
- [ ] **Category** - At least one selected
- [ ] **Author** - Selected
- [ ] **SEO** - Meta title & description (optional)
- [ ] **Preview** - Checked and looks good
- [ ] **Videos** - Playing correctly (if any)
- [ ] **Links** - All working
- [ ] **Spelling** - Proofread for typos

---

## 🎬 Real Example: Creating Sample Article

Let's create a complete article together:

### Example Article Details

**Title:**
```
Germany Announces €500M Fund for Refugee Integration
```

**Slug:** (auto-generated)
```
germany-announces-500m-fund-for-refugee-integration
```

**Excerpt:**
```
German government unveils €500 million integration fund to support refugee employment, education, and housing initiatives across 16 federal states.
```

**Body:**
```
## Major Investment in Integration

The German federal government announced today a comprehensive €500 million fund aimed at accelerating refugee integration across all 16 federal states.

## Key Components

The fund will focus on three main areas:

### Employment Programs
- Job training and placement services
- German language courses for professionals
- Recognition of foreign qualifications

### Education Support
- School enrollment assistance for children
- University pathway programs
- Vocational training partnerships

### Housing Initiatives
- Affordable housing construction
- Rent subsidies for qualifying families
- Community integration centers

## Eligibility and Timeline

The program launches January 2026 and is open to refugees who have been granted asylum in Germany since 2020. Applications will be processed through local integration offices.

Chancellor Angela Schulz stated: "This investment represents our commitment to successful integration and Germany's humanitarian values."

## How to Apply

Visit [Integration Fund Portal](https://example.com) for application details and eligibility requirements.
```

**Main Image:**
- Upload: German flag or government building
- Alt text: "German Federal Chancellery building in Berlin"

**Video:**
- YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- (Chancellor's announcement speech)

**Category:**
- Politics
- World

**Author:**
- Select your author

**Special Settings:**
- ☑️ Is Breaking (urgent news)
- ☐ Is Live
- ☑️ Is Featured (important story)

**SEO:**
- Meta Title: "Germany's €500M Refugee Integration Fund 2026"
- Meta Description: "Germany announces €500M fund for refugee integration with employment, education, and housing programs. Applications open January 2026."
- Keywords: "Germany, refugee, integration, fund, employment, education"

**Then:**
1. Preview
2. Verify everything looks good
3. Click **Publish**
4. Done! 🎉

---

## 🆘 Common Issues & Solutions

### Issue: "Publish button is gray/disabled"

**Solution:**
- Check required fields (usually Title and Slug)
- Look for red error messages
- Scroll through entire form

### Issue: "Image not uploading"

**Solution:**
- Check file size (< 5MB)
- Use JPG or PNG format
- Check internet connection
- Try smaller image

### Issue: "Video not playing"

**Solution:**
- Verify video URL is correct
- Check video is public (not private)
- Try opening video URL in new tab
- Use YouTube or Vimeo instead of direct upload

### Issue: "Article not showing on homepage"

**Solution:**
- Verify article is **Published** (not draft)
- Wait 60 seconds for cache refresh
- Hard refresh page (Ctrl+Shift+R)
- Check it's not filtered by category

### Issue: "Can't find Categories option"

**Solution:**
- Create categories first (Categories → + Create)
- Then return to article

---

## 🎓 Next Steps

Now that you know how to add articles:

1. **Create 3-5 practice articles**
   - Test different layouts
   - Try videos and images
   - Experiment with categories

2. **Add more authors**
   - Create team member profiles
   - Add bio and photos

3. **Organize categories**
   - Review existing categories
   - Create new ones if needed
   - Assign colors

4. **Test features**
   - Try breaking news
   - Test live updates
   - Check multilingual

5. **Optimize workflow**
   - Learn keyboard shortcuts
   - Save drafts frequently
   - Preview before publishing

---

## 📞 Need Help?

- **Full Documentation:** See `CONTENT_MANAGEMENT_GUIDE.md`
- **Quick Reference:** See `QUICK_START.md`
- **Sanity Help:** https://www.sanity.io/docs
- **Support:** admin@nrbeurope.com

---

**Happy Publishing! 🚀📰**

Remember: Your first article might take 10-15 minutes. After that, you'll create articles in 5 minutes or less!

---

**Last Updated:** February 1, 2026
