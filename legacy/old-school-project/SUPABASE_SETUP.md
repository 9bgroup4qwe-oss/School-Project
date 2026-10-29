# GrowMyIQ - Supabase Setup Guide

Follow these quick steps to set up your Supabase project for GrowMyIQ.

---

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose a Name (e.g. `GrowMyIQ`), enter a Database Password, and select your region.
4. Wait ~1 minute for the project to provision.

---

### Step 2: Run the Database Schema
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](file:///Users/AyushMehrotra/Desktop/School%20project/School-Project/school-project/supabase/schema.sql) in this repository.
4. Copy the entire contents and paste into the Supabase SQL editor.
5. Click **Run** (or `Cmd + Enter`).
6. You should see `Success. No rows returned`. All tables, RLS policies, triggers, and reference data are now created!

---

### Step 3: Get Your API Keys
1. In your Supabase Dashboard, click **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL**
   - **anon / public** API Key

---

### Step 4: Configure Your `.env.local`
In the `school-project/` folder, ensure your `.env.local` has:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Python Backend URL (for AI quiz and timetable features)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Gemini API Key (optional - smart fallback included if not set)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Step 5: (Optional) Email Auth Confirmation Setting
For easier local testing without waiting for confirmation emails:
1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**.
2. Turn off **"Confirm email"**.
3. Save changes. Users can now sign in immediately after signing up!
