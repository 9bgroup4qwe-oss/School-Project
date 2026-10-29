-- =============================================================================
-- GrowMyIQ - Complete Supabase Database Schema
-- =============================================================================
-- Instructions:
-- 1. Open your Supabase project dashboard (https://supabase.com/dashboard)
-- 2. Navigate to the "SQL Editor" in the left navigation
-- 3. Click "New query", paste the entire contents of this file, and click "Run"
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE (Auto-synced with Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  grade_level TEXT DEFAULT 'Grade 10',
  school_type TEXT DEFAULT 'High School',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. QUIZ SYSTEM TABLES
-- =============================================================================

-- Quiz Sessions
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapters TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL DEFAULT 10,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER DEFAULT 0, -- in seconds
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_hash TEXT,
  question_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Answers
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL CHECK (selected_option >= 0 AND selected_option <= 3),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER DEFAULT 0, -- Seconds spent on this question
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- User Subject Statistics
CREATE TABLE IF NOT EXISTS public.user_subject_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_quizzes INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  recent_attempts INTEGER DEFAULT 0,
  last_quiz_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- User Chapter Statistics
CREATE TABLE IF NOT EXISTS public.user_chapter_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  weak_area BOOLEAN DEFAULT FALSE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject, chapter)
);

-- Quiz Templates
CREATE TABLE IF NOT EXISTS public.quiz_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapters TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL DEFAULT 10,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. TIMETABLE SYSTEM TABLES
-- =============================================================================

-- User Timetables
CREATE TABLE IF NOT EXISTS public.user_timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Timetable',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  shared_with UUID[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable Templates
CREATE TABLE IF NOT EXISTS public.timetable_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable History
CREATE TABLE IF NOT EXISTS public.timetable_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES public.user_timetables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'shared', 'duplicated')),
  change_description TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable Reference Activities
CREATE TABLE IF NOT EXISTS public.timetable_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  default_color TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable Shares
CREATE TABLE IF NOT EXISTS public.timetable_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES public.user_timetables(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(timetable_id, shared_with)
);

-- Timetable Analytics
CREATE TABLE IF NOT EXISTS public.timetable_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES public.user_timetables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('viewed', 'created', 'updated', 'shared', 'exported', 'duplicated')),
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON public.quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON public.quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON public.quiz_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON public.quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_subject_stats_user_id ON public.user_subject_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chapter_stats_user_id ON public.user_chapter_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_timetables_user_id ON public.user_timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_active ON public.user_timetables(is_active);

-- =============================================================================
-- 5. AUTOMATIC TIMESTAMP UPDATERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_sessions_updated_at ON public.quiz_sessions;
CREATE TRIGGER update_quiz_sessions_updated_at BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subject_stats_updated_at ON public.user_subject_stats;
CREATE TRIGGER update_user_subject_stats_updated_at BEFORE UPDATE ON public.user_subject_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_chapter_stats_updated_at ON public.user_chapter_stats;
CREATE TRIGGER update_user_chapter_stats_updated_at BEFORE UPDATE ON public.user_chapter_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_timetables_updated_at ON public.user_timetables;
CREATE TRIGGER update_user_timetables_updated_at BEFORE UPDATE ON public.user_timetables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 6. QUIZ CALCULATION & STATS FUNCTIONS
-- =============================================================================

-- Update user subject stats
CREATE OR REPLACE FUNCTION public.update_user_subject_stats(
    p_user_id UUID,
    p_subject TEXT,
    p_score DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_subject_stats (
        user_id,
        subject,
        total_quizzes,
        last_quiz_date,
        average_score,
        best_score,
        recent_attempts
    ) VALUES (
        p_user_id,
        p_subject,
        1,
        NOW(),
        p_score,
        p_score,
        1
    )
    ON CONFLICT (user_id, subject) DO UPDATE SET
        total_quizzes = public.user_subject_stats.total_quizzes + 1,
        last_quiz_date = NOW(),
        average_score = (
            (public.user_subject_stats.average_score * public.user_subject_stats.total_quizzes + p_score) /
            (public.user_subject_stats.total_quizzes + 1)
        ),
        best_score = GREATEST(public.user_subject_stats.best_score, p_score),
        recent_attempts = CASE
            WHEN public.user_subject_stats.last_quiz_date >= NOW() - INTERVAL '30 days'
            THEN public.user_subject_stats.recent_attempts + 1
            ELSE 1
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete a quiz session and calculate all results
CREATE OR REPLACE FUNCTION public.complete_quiz_session(
    p_session_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_session RECORD;
    v_correct_count INTEGER;
    v_total_questions INTEGER;
    v_score DECIMAL;
BEGIN
    -- Get session info
    SELECT * INTO v_session FROM public.quiz_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate total questions
    SELECT COUNT(*) INTO v_total_questions
    FROM public.quiz_questions
    WHERE session_id = p_session_id;

    -- Calculate correct answers count
    SELECT COUNT(*) INTO v_correct_count
    FROM public.quiz_answers qa
    WHERE qa.session_id = p_session_id AND qa.is_correct = true;

    -- Score calculation
    v_score := CASE
        WHEN v_total_questions > 0
        THEN ROUND((v_correct_count * 100.0 / v_total_questions), 2)
        ELSE 0
    END;

    -- Update session record
    UPDATE public.quiz_sessions SET
        completed_at = NOW(),
        total_questions = v_total_questions,
        correct_answers = v_correct_count,
        score_percentage = v_score,
        status = 'completed'
    WHERE id = p_session_id;

    -- Update subject statistics
    IF v_session.user_id IS NOT NULL THEN
        PERFORM public.update_user_subject_stats(v_session.user_id, v_session.subject, v_score);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subject_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chapter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_activities ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Quiz Sessions Policies
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can insert their own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can delete their own quiz sessions" ON public.quiz_sessions FOR DELETE USING (auth.uid() = user_id);

-- Quiz Questions Policies
DROP POLICY IF EXISTS "Users can view questions from their sessions" ON public.quiz_questions;
CREATE POLICY "Users can view questions from their sessions" ON public.quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = quiz_questions.session_id AND (user_id = auth.uid() OR user_id IS NULL))
);

DROP POLICY IF EXISTS "Users can insert questions for their sessions" ON public.quiz_questions;
CREATE POLICY "Users can insert questions for their sessions" ON public.quiz_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = quiz_questions.session_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- Quiz Answers Policies
DROP POLICY IF EXISTS "Users can manage their own quiz answers" ON public.quiz_answers;
CREATE POLICY "Users can manage their own quiz answers" ON public.quiz_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = quiz_answers.session_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- User Stats Policies
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_subject_stats;
CREATE POLICY "Users can view their own stats" ON public.user_subject_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_subject_stats;
CREATE POLICY "Users can insert their own stats" ON public.user_subject_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_subject_stats;
CREATE POLICY "Users can update their own stats" ON public.user_subject_stats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view chapter stats" ON public.user_chapter_stats;
CREATE POLICY "Users can view chapter stats" ON public.user_chapter_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert chapter stats" ON public.user_chapter_stats;
CREATE POLICY "Users can insert chapter stats" ON public.user_chapter_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update chapter stats" ON public.user_chapter_stats;
CREATE POLICY "Users can update chapter stats" ON public.user_chapter_stats FOR UPDATE USING (auth.uid() = user_id);

-- Timetable Policies
DROP POLICY IF EXISTS "Users can view their own timetables" ON public.user_timetables;
CREATE POLICY "Users can view their own timetables" ON public.user_timetables
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with) OR is_public = true);

DROP POLICY IF EXISTS "Users can insert their own timetables" ON public.user_timetables;
CREATE POLICY "Users can insert their own timetables" ON public.user_timetables FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own timetables" ON public.user_timetables;
CREATE POLICY "Users can update their own timetables" ON public.user_timetables FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own timetables" ON public.user_timetables;
CREATE POLICY "Users can delete their own timetables" ON public.user_timetables FOR DELETE USING (auth.uid() = user_id);

-- Activities reference table
DROP POLICY IF EXISTS "Anyone can view timetable activities" ON public.timetable_activities;
CREATE POLICY "Anyone can view timetable activities" ON public.timetable_activities FOR SELECT USING (true);

-- =============================================================================
-- 8. INITIAL REFERENCE DATA
-- =============================================================================
INSERT INTO public.timetable_activities (activity_type, display_name, default_color, icon_name, category, sort_order) VALUES
('class', 'Class', '#537fe7', 'BookOpen', 'academic', 1),
('study', 'Study Session', '#ffe537', 'BookOpen', 'academic', 2),
('meal', 'Meal Break', '#ef4444', 'Coffee', 'personal', 3),
('break', 'Rest & Break', '#22c55e', 'Coffee', 'personal', 4),
('activity', 'Extracurricular', '#f59e0b', 'Music', 'extracurricular', 5),
('personal', 'Personal Time', '#8b5cf6', 'Clock', 'personal', 6),
('exercise', 'Workout / Sports', '#10b981', 'Dumbbell', 'health', 7),
('assignment', 'Homework / Project', '#06b6d4', 'FileText', 'academic', 8),
('exam', 'Exam / Test', '#dc2626', 'AlertCircle', 'academic', 9)
ON CONFLICT (activity_type) DO NOTHING;

-- =============================================================================
-- SETUP COMPLETE!
-- Your GrowMyIQ database is now fully ready for authentication, quizzes, and timetables.
-- =============================================================================
