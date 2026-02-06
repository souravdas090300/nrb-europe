# Create Super Admin User via Studio

Since API tokens are having authentication issues, use this method instead:

## Steps:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open Sanity Studio:**
   Navigate to: http://localhost:3000/studio

3. **Sign in with your account**
   - Click "Sign in" 
   - Use your GitHub/Google/Email authentication
   - This uses OAuth which is more reliable than API tokens

4. **Create the User document:**
   - Click "+" or go to Content → User
   - Create new User with:
     - Name: "Super Admin"
     - Email: souravdas090300@gmail.com
     - Role: superAdmin
     - Is Active: true (checked)
     - Position: "Administrator"
     - Article Count: 0

5. **Create Default Categories:**
   Create these category documents:
   - Politics
   - Business  
   - Sports
   - Technology
   - Health
   - Entertainment
   - World
   - Europe

## Why This Works:

- **Browser authentication** doesn't require API tokens
- **OAuth is more secure** and doesn't have session expiry issues
- **Studio UI** provides validation and schema checking
- **Immediate visual feedback** on what you're creating

## After Setup:

Once you have the admin user and categories created, you can:
- Start creating articles directly in the Studio
- Use the admin dashboard at http://localhost:3000/admin/dashboard
- The API token issues won't affect Studio usage
