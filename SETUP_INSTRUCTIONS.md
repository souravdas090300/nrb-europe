# NRB Europe - Setup Instructions

## 🚀 Quick Start Guide

### Step 0: Choose Your Environment

This project uses separate environments:
- **Development:** Uses `.env.dev` template → create `.env.local` for local work
- **Production:** Uses `.env.production` template → for deployment configuration

### Step 1: Setup Local Environment

```powershell
# Copy development environment template
Copy-Item .env.dev .env.local
```

This creates your local environment file with development settings (development dataset, localhost URLs, test keys).

### Step 2: Get Your Sanity API Token

1. **Visit Sanity Management Console:**
   - Go to: https://sanity.io/manage/project/3vvbog83/api
   - Login with your Sanity account

2. **Create a New API Token:**
   - Click "Add API token"
   - Name: `NRB Europe Admin`
   - Permissions: Select **"Editor"** (allows read + write)
   - Click "Create"
   - **COPY THE TOKEN** (you won't see it again!)

3. **Update your `.env.local` file:**
   ```env
   SANITY_API_TOKEN=skxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Generate Webhook Secrets

Generate random secrets for webhooks and revalidation:

```powershell
# Run in PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Update in `.env.local`:
```env
SANITY_WEBHOOK_SECRET=your_generated_secret_here
REVALIDATE_SECRET=your_generated_secret_here
```

### Step 4: Create Super Admin User

Run the automated setup script:

```powershell
npm run setup-admin
```

This will:
- ✅ Create a super admin user
- ✅ Set up default categories
- ✅ Verify environment configuration

### Step 5: Deploy Sanity Schema

Deploy your content schema to Sanity:

```powershell
npm run deploy-schema
```

### Step 6: Start Development Server

```powershell
npm run dev
```

Then open:
- **Website:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio

---

## 📝 Environment Variables Reference

### Development Environment (`.env.dev` → `.env.local`)
```env
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Use test/development keys
STRIPE_SECRET_KEY=sk_test_...
```

### Production Environment (`.env.production`)
```env
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_BASE_URL=https://nrbeurope.com
# Use live/production keys
STRIPE_SECRET_KEY=sk_live_...
```

### Required (Minimum Setup)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=3vvbog83
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...                    # Get from Sanity
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
```

### Optional Features

#### Analytics
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Email Services (choose one)
```env
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
```

#### Push Notifications
Generate VAPID keys:
```powershell
npx web-push generate-vapid-keys
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

#### Stripe (for paid subscriptions)
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Redis (for caching/high traffic)
```env
REDIS_URL=redis://localhost:6379
```

---

## 🔐 User Roles

### Super Admin
- Full system access
- Can create/edit/delete all content
- Manage users and roles
- Access all settings

### Editor
- Review and approve content
- Publish articles
- Manage categories
- View analytics

### Contributor
- Create draft articles
- Submit for review
- Edit own content

### Viewer
- Read-only access
- View published content

---

## 📚 Next Steps

1. **Configure Sanity Webhooks:**
   - Go to: https://sanity.io/manage/project/3vvbog83/webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/breaking-news`
   - Trigger: On create/update where `isBreakingNews == true`
   - Secret: Use value from `SANITY_WEBHOOK_SECRET` in `.env.local`

2. **Set up Production Environment:**
   - Deploy to Vercel/Netlify
   - Update `NEXT_PUBLIC_BASE_URL` to your domain
   - Configure production environment variables

3. **Configure Analytics:**
   - Set up Google Analytics
   - Add tracking ID to `.env.local`

4. **Test the System:**
   - Create a test article in Studio
   - Verify it appears on the website
   - Test the editorial workflow

---

## 🆘 Troubleshooting

### "Missing environment variable" error
- Check all required variables are in `.env.local`
- Restart the dev server after changing `.env.local`

### Cannot access Studio
- Verify Studio layout file exists at `src/app/studio/[[...tool]]/layout.tsx`
- Clear `.next` folder: `Remove-Item -Recurse -Force .next`
- Restart dev server

### Admin user not created
- Verify `SANITY_API_TOKEN` has "Editor" permissions
- Check token is correctly copied (no extra spaces)
- Run setup script again: `npm run setup-admin`

### Schema deployment fails
- Verify you're logged in to Sanity: `npx sanity login`
- Check schema files for syntax errors
- Try: `npx sanity schema validate`

---

## 📞 Support

- **Documentation:** See `ADMIN_SYSTEM.md` and `CONTENT_MANAGEMENT_GUIDE.md`
- **Sanity Docs:** https://www.sanity.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Last Updated:** February 5, 2026
