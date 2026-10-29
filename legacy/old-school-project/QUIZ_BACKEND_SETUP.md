# Quiz Backend Setup Guide

## 🚀 Quick Setup Steps

### 1. Run Database Migrations
Go to your Supabase project → SQL Editor → Run these scripts in order:

1. **001_create_quiz_tables.sql**
   - Creates all quiz-related tables
   - Sets up indexes and triggers

2. **002_quiz_rls_policies.sql**
   - Enables Row Level Security
   - Sets up user access policies

3. **003_quiz_functions.sql**
   - Creates functions for stats calculation
   - Handles automatic updates

### 2. Verify Environment Variables
Make sure your `.env.local` has:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API (already configured)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Test the Integration
1. Start your app: `npm run dev`
2. Login to your account
3. Go to Quizzer from the sidebar
4. Create and complete a quiz
5. Check your Supabase dashboard to see the data

## 📊 What Gets Tracked

- **Quiz Sessions**: Every quiz attempt with metadata
- **Questions**: All generated questions with explanations
- **Answers**: Each user selection with timing
- **Performance Stats**: Automatic calculation of:
  - Subject-wise averages
  - Chapter-wise accuracy
  - Weak areas identification
  - Recent activity tracking

## 🔍 How to Verify It's Working

1. After completing a quiz, check Supabase tables:
   - `quiz_sessions` - Should have a new entry
   - `quiz_questions` - Should have all questions
   - `quiz_answers` - Should have your answers
   - `user_subject_stats` - Should update automatically

2. Check browser console for any errors

3. Use the SQL Editor to query:
   ```sql
   SELECT * FROM quiz_sessions WHERE user_id = auth.uid() ORDER BY created_at DESC;
   ```

## 🐛 Troubleshooting

- **401 Unauthorized**: Check your Supabase auth setup
- **Permission denied**: Run the RLS policies script
- **Data not saving**: Check console for API errors
- **Stats not updating**: Ensure function scripts ran successfully

## 📝 Next Features to Build

1. Quiz History Page (`/quiz/history`)
2. Analytics Dashboard (`/analytics`)
3. Mistake Review Page (`/quiz/mistakes`)

These pages will use the API endpoints already created!