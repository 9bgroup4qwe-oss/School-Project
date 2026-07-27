# Environment Setup Guide

This guide explains how to configure all the external services and environment variables required for LearnDash to function properly.

## 📋 Overview

LearnDash requires integration with three main external services:
1. **Supabase** - Database and Authentication
2. **Google Gemini AI** - Quiz generation and timetable creation
3. **Application Configuration** - Local development settings

## 🔑 Environment Variables

### Create `.env.local`

In the root of your project, create a file named `.env.local`:

```bash
touch .env.local
```

### Complete Environment Configuration

```env
# =================================
# SUPABASE CONFIGURATION
# =================================
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =================================
# GOOGLE GEMINI AI
# =================================
# Get this from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...

# =================================
# APPLICATION CONFIGURATION
# =================================
# The URL where your app is running
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Environment (development/production)
NODE_ENV=development

# =================================
# OPTIONAL: ANALYTICS (future feature)
# =================================
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🛠️ Supabase Setup

### Step 1: Create a Supabase Project

1. **Sign Up/In** to [Supabase](https://supabase.com)
2. **Click "New Project"**
3. **Fill in project details**:
   - **Name**: `learndash-db` (or your preferred name)
   - **Database Password**: Use a strong, memorable password
   - **Region**: Choose the region closest to you
   - **Organization**: Create or select an organization

### Step 2: Get Your Credentials

1. **Go to Settings** → **API** in your Supabase dashboard
2. **Copy these values**:

#### Project URL
```
https://your-project-id.supabase.co
```

#### Public API Key (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Service Role Key (keep secret!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure Authentication

1. **Go to Authentication** → **Settings**
2. **Set Site URL**:
   ```
   http://localhost:3001
   ```

3. **Add Redirect URLs**:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001
   ```

4. **Enable Email/Password Auth**:
   - Scroll down to "User Authentication"
   - Ensure "Enable email signups" is ON
   - Ensure "Enable phone signups" is OFF (unless needed)

### Step 4: Run Database Migrations

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New query"**
3. **Run each migration file in order**:

#### Migration 1: Create Tables
```sql
-- Copy contents of: supabase/migrations/001_create_quiz_tables.sql
```

#### Migration 2: Set Up Security
```sql
-- Copy contents of: supabase/migrations/002_quiz_rls_policies.sql
```

#### Migration 3: Create Functions
```sql
-- Copy contents of: supabase/migrations/003_quiz_functions.sql
```

### Step 5: Verify Database Setup

1. **Go to Table Editor**
2. **You should see these tables**:
   - `quiz_sessions`
   - `quiz_questions`
   - `quiz_answers`
   - `user_subject_stats`
   - `user_chapter_stats`
   - `quiz_templates`

## 🤖 Google Gemini AI Setup

### Step 1: Get API Key

1. **Go to [Google AI Studio](https://makersuite.google.com/app/apikey)**
2. **Sign in with your Google account**
3. **Click "Create API Key"**
4. **Name your key**: `LearnDash Production` or similar
5. **Copy the generated key**:
   ```
   AIzaSy...
   ```

### Step 2: Enable Gemini API (if required)

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (or create a new one)
3. **Go to "APIs & Services" → "Library"**
4. **Search for "Gemini API"**
5. **Click on it and press "Enable"**

### Step 3: Verify API Access

1. **Open your terminal**
2. **Run this curl command** (replace YOUR_API_KEY):
   ```bash
   curl -X POST \
     https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY \
     -H 'Content-Type: application/json' \
     -d '{
       "contents": [{
         "parts": [{"text": "Hello"}]
       }]
     }'
   ```

3. **You should get a response** with generated content

## 🔧 Application Configuration

### Development Environment

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### Production Environment

When deploying to production:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 🧪 Test Your Configuration

### Test Supabase Connection

Create a test file `test-supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('count')

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful!')
    }
  } catch (err) {
    console.error('❌ Connection error:', err)
  }
}

testConnection()
```

Run with: `node test-supabase.js`

### Test Gemini API

Create a test file `test-gemini.js`:

```javascript
const API_KEY = process.env.GEMINI_API_KEY

async function testGemini() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Test message" }] }]
      })
    })

    if (response.ok) {
      console.log('✅ Gemini API working!')
    } else {
      console.error('❌ Gemini API failed:', response.status)
    }
  } catch (err) {
    console.error('❌ API error:', err)
  }
}

testGemini()
```

Run with: `node test-gemini.js`

## 🚨 Security Best Practices

### 1. Never Commit `.env.local`

Add this to your `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. Use Different Keys for Different Environments

- **Development**: Use separate keys
- **Staging**: Use separate keys
- **Production**: Use production keys only

### 3. Key Rotation

- **Supabase**: Regenerate keys every 90 days
- **Gemini API**: Monitor usage and regenerate if compromised

### 4. Environment-Specific Configuration

For different environments, create:

```bash
# Development
.env.development.local

# Staging
.env.staging.local

# Production
.env.production.local
```

## 🔍 Troubleshooting

### Supabase Issues

**Error**: "Invalid API key"
- **Solution**: Double-check your API key is copied correctly
- Ensure no extra spaces or newline characters

**Error**: "Database not found"
- **Solution**: Verify your project URL is correct
- Check that migrations have been run

**Error**: "Permission denied"
- **Solution**: Ensure RLS policies have been applied
- Check your user is authenticated

### Gemini API Issues

**Error**: "API key not valid"
- **Solution**: Verify API key is correct
- Ensure Gemini API is enabled in Google Cloud

**Error**: "Quota exceeded"
- **Solution**: Check your usage limits
- Request increased quota if needed

**Error**: "Model not found"
- **Solution**: Ensure you're using the correct model name
- Use: `gemini-2.0-flash-exp`

### General Issues

**Error**: "Environment variable not found"
- **Solution**: Ensure `.env.local` is in the root directory
- Restart your development server after changing env vars

**Error**: "CORS error"
- **Solution**: Ensure your domain is added to Supabase CORS settings
- Check your APP_URL is correct

## 📚 Next Steps

After setting up your environment:

1. **Complete the Installation Guide**
2. **Read the Development Workflow**
3. **Explore the Architecture Documentation**
4. **Start Building Features!**

## 🆘 Need Help?

If you're having trouble with environment setup:

1. **Check the Supabase documentation**: [docs.supabase.com](https://docs.supabase.com)
2. **Check Gemini API documentation**: [ai.google.dev](https://ai.google.dev)
3. **Create an issue** with your error details
4. **Join our Discord** for real-time help

---

Remember: Keep your API keys secure and never share them publicly! 🔒