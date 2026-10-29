# Installation Guide

This guide will walk you through setting up the LearnDash learning management system on your local machine for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify with: `node --version` (should be 18.x or higher)

- **npm**: Version 8.0 or higher (comes with Node.js)
  - Verify with: `npm --version`

- **Git**: Latest version
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify with: `git --version`

### Required Accounts
- **GitHub Account**: For cloning the repository
- **Supabase Account**: For database and authentication
  - Sign up at [supabase.com](https://supabase.com/)
- **Google Account**: For Gemini AI API key
  - Required for quiz and timetable generation

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository (replace with your actual repository URL)
git clone https://github.com/your-username/learning-app.git

# Navigate into the project directory
cd learning-app

# Verify the structure
ls -la
```

### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - Next.js and related packages
# - React and TypeScript
# - Tailwind CSS
# - Supabase client
# - UI components (shadcn/ui)
# - All other required packages
```

### 3. Verify Installation

```bash
# Check if the project starts correctly
npm run dev
```

You should see output similar to:
```
> learning-app@0.1.0 dev
> next dev

▲ Next.js 15.5.4
- Local:        http://localhost:3001
- Environments: .env.local
✓ Ready in 4s
```

> **Note**: The app will show errors because we haven't configured environment variables yet. This is expected.

### 4. Set Up Environment Variables

Create a new file named `.env.local` in the root of your project:

```bash
# Create the environment file
touch .env.local
```

Add the following content to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

> **Important**: Replace the placeholder values with your actual keys. See [Environment Setup Guide](./environment-setup.md) for detailed instructions.

### 5. Set Up Supabase Database

Follow these steps to configure your Supabase project:

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com/)
   - Click "Start your project"
   - Sign in with your GitHub account
   - Create a new organization (or use existing)
   - Create a new project:
     - Name: `learndash-db`
     - Database Password: Use a strong password
     - Region: Choose closest to your location

2. **Get your Supabase credentials**
   - Go to Settings → API
   - Copy the Project URL
   - Copy the `anon` public key
   - Copy the `service_role` key (keep this secret!)

3. **Update environment variables**
   ```env
   # Add your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run database migrations**
   - Go to the SQL Editor in your Supabase dashboard
   - Run the migration scripts in order from `supabase/migrations/`:
     1. `001_create_quiz_tables.sql`
     2. `002_quiz_rls_policies.sql`
     3. `003_quiz_functions.sql`

5. **Configure authentication**
   - Go to Authentication → Settings
   - Set Site URL to: `http://localhost:3001`
   - Add redirect URLs:
     - `http://localhost:3001/auth`
     - `http://localhost:3001`

### 6. Set Up Gemini AI

1. **Get your API key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Add to environment variables**
   ```env
   GEMINI_API_KEY=your-actual-gemini-api-key
   ```

3. **Enable Gemini API** (if required)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to APIs & Services → Library
   - Search for "Gemini API"
   - Click "Enable"

### 7. Final Verification

```bash
# Stop the current server (Ctrl+C)
# Start fresh
npm run dev
```

Open your browser and navigate to [http://localhost:3001](http://localhost:3001).

You should see:
- ✅ Landing page loading correctly
- ✅ Navigation working
- ✅ Dark theme applied
- ✅ Glassmorphism effects visible

## 🧪 Test the Setup

### 1. Test Authentication
1. Click "Sign In" or "Get Started"
2. Navigate to the auth page at `/auth`
3. Try to create a new account
4. Verify you can sign in

### 2. Test Quiz System
1. Sign in to your account
2. Click "Quizzer" in the sidebar
3. Create a new quiz
4. Answer a few questions
5. Complete the quiz
6. Check your Supabase dashboard → Table Editor
7. Verify data in: `quiz_sessions`, `quiz_questions`, `quiz_answers`

### 3. Test Timetable AI
1. Click "Timetable" in the sidebar
2. Start chatting with the AI
3. Provide your school details
4. Generate a timetable

## 🔧 Common Issues & Solutions

### Issue: "Port 3000 is in use"
**Solution**: The app automatically uses port 3001 if 3000 is busy. This is normal.

### Issue: "Supabase connection error"
**Solution**:
- Verify your `.env.local` values are correct
- Check your Supabase project is active
- Ensure migrations have been run

### Issue: "Gemini API error"
**Solution**:
- Verify your API key is correct
- Check if Gemini API is enabled in Google Cloud
- Verify you have API quota available

### Issue: "TypeScript errors"
**Solution**:
- Run `npm run type-check` to see all errors
- Ensure all dependencies are installed
- Check for missing type definitions

### Issue: "Styling issues"
**Solution**:
- Ensure you're using Node.js 18+
- Clear your browser cache
- Check for Tailwind CSS compilation errors

## 📚 Next Steps

Once your installation is complete:

1. **Read the Development Workflow** guide
2. **Explore the Architecture** documentation
3. **Learn about Features** you want to work on
4. **Check the API Reference** for integration details

## 🆘 Need Help?

If you run into any issues:

1. **Check the troubleshooting section** above
2. **Search existing GitHub issues**
3. **Create a new issue** with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

4. **Join our Discord community** (link in README)

## 🎉 You're Ready!

Congratulations! You now have LearnDash running locally. You can:
- Develop new features
- Customize the design
- Add your own content
- Deploy to production

Happy coding! 🚀