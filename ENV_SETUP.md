# Environment Configuration Guide

This project uses separate environment files for development and production:

## 📁 Environment Files

### `.env.dev` - Development Environment
- **Dataset:** `development` (Sanity development dataset)
- **URL:** `http://localhost:3000`
- **Stripe:** Test keys (sk_test_...)
- **Analytics:** Disabled
- **Social Media:** Disabled
- **Use for:** Local development and testing

### `.env.production` - Production Environment
- **Dataset:** `production` (Sanity production dataset)
- **URL:** `https://nrbeurope.com`
- **Stripe:** Live keys (sk_live_...)
- **Analytics:** Enabled
- **Social Media:** Enabled
- **Use for:** Production deployment (Vercel/Netlify)

## 🚀 Usage

### Development (Local)
```powershell
# Copy .env.dev to .env.local for local development
Copy-Item .env.dev .env.local

# Update your API tokens in .env.local
# Then start dev server
npm run dev
```

### Production (Deployment)
When deploying to Vercel/Netlify:
1. Use values from `.env.production`
2. Add them as environment variables in your hosting platform
3. Never commit `.env.local` (it's in .gitignore)

## 🔐 Security

- ✅ `.env.dev` - Committed (no secrets, template only)
- ✅ `.env.production` - Committed (no secrets, template only)
- ❌ `.env.local` - Never committed (contains actual secrets)

## 📝 Setup Steps

1. **Copy dev environment:**
   ```powershell
   Copy-Item .env.dev .env.local
   ```

2. **Get Sanity API Token:**
   - Visit: https://sanity.io/manage/project/3vvbog83/api
   - Create token with "Editor" permissions
   - Add to `.env.local`

3. **Generate secrets:**
   ```powershell
   # Run twice for two different secrets
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

4. **Update `.env.local`:**
   ```env
   SANITY_API_TOKEN=sk_your_actual_token
   SANITY_WEBHOOK_SECRET=generated_secret_1
   REVALIDATE_SECRET=generated_secret_2
   ```

5. **Run setup:**
   ```powershell
   npm run setup-admin
   npm run deploy-schema
   npm run dev
   ```

## 🔄 Switching Environments

### Use Development Dataset
```powershell
# Ensure .env.local has:
NEXT_PUBLIC_SANITY_DATASET=development
```

### Use Production Dataset
```powershell
# Update .env.local:
NEXT_PUBLIC_SANITY_DATASET=production
```

## 📦 Deployment Checklist

When deploying to production:

- [ ] Create production Sanity API token
- [ ] Generate strong webhook secrets
- [ ] Set up production Stripe keys
- [ ] Configure Google Analytics
- [ ] Set up email service (SendGrid/Resend)
- [ ] Configure push notifications
- [ ] Set up error monitoring (Sentry)
- [ ] Add all environment variables to hosting platform
- [ ] Test webhooks with production URL
- [ ] Verify social media integrations

## 🆘 Troubleshooting

**Wrong dataset showing:**
- Check `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`
- Restart dev server after changing env variables

**Missing content:**
- Verify you're using the correct dataset (development vs production)
- Run `npm run setup-admin` for the active dataset

**API errors:**
- Verify `SANITY_API_TOKEN` is correct
- Check token permissions (needs "Editor")
- Ensure token matches the project ID

---

**Important:** Always use `.env.local` for local development. Never commit it to version control.
