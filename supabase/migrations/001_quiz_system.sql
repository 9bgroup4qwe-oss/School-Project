-- Consolidated Migration 001: Quiz Tables, Indexes, and Functions
-- Project: Clean Rewrite

-- 1. Tables
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapters TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_hash TEXT NOT NULL,
  question_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL CHECK (selected_option >= 0 AND selected_option <= 3),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

CREATE TABLE IF NOT EXISTS user_subject_stats (
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

CREATE TABLE IF NOT EXISTS user_chapter_stats (
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

CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapters TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_subject ON quiz_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON quiz_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_hash ON quiz_questions(question_hash);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_subject_stats_user_id ON user_subject_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chapter_stats_user_id ON user_chapter_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_subject ON quiz_templates(subject);

-- 3. RLS
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subject_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chapter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
  CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
  CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON quiz_sessions;
  CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;
  CREATE POLICY "Users can delete their own quiz sessions" ON quiz_sessions FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view questions from their sessions" ON quiz_questions;
  CREATE POLICY "Users can view questions from their sessions" ON quiz_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE quiz_sessions.id = quiz_questions.session_id AND quiz_sessions.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "Users can insert questions for their sessions" ON quiz_questions;
  CREATE POLICY "Users can insert questions for their sessions" ON quiz_questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE quiz_sessions.id = quiz_questions.session_id AND quiz_sessions.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "Users can view their own quiz answers" ON quiz_answers;
  CREATE POLICY "Users can view their own quiz answers" ON quiz_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE quiz_sessions.id = quiz_answers.session_id AND quiz_sessions.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "Users can insert their own quiz answers" ON quiz_answers;
  CREATE POLICY "Users can insert their own quiz answers" ON quiz_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE quiz_sessions.id = quiz_answers.session_id AND quiz_sessions.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "Users can update their own quiz answers" ON quiz_answers;
  CREATE POLICY "Users can update their own quiz answers" ON quiz_answers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE quiz_sessions.id = quiz_answers.session_id AND quiz_sessions.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "Users can view their own subject stats" ON user_subject_stats;
  CREATE POLICY "Users can view their own subject stats" ON user_subject_stats FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own subject stats" ON user_subject_stats;
  CREATE POLICY "Users can insert their own subject stats" ON user_subject_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update their own subject stats" ON user_subject_stats;
  CREATE POLICY "Users can update their own subject stats" ON user_subject_stats FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view their own chapter stats" ON user_chapter_stats;
  CREATE POLICY "Users can view their own chapter stats" ON user_chapter_stats FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own chapter stats" ON user_chapter_stats;
  CREATE POLICY "Users can insert their own chapter stats" ON user_chapter_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update their own chapter stats" ON user_chapter_stats;
  CREATE POLICY "Users can update their own chapter stats" ON user_chapter_stats FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Anyone can view public quiz templates" ON quiz_templates;
  CREATE POLICY "Anyone can view public quiz templates" ON quiz_templates FOR SELECT USING (is_public = true);

  DROP POLICY IF EXISTS "Users can view their own quiz templates" ON quiz_templates;
  CREATE POLICY "Users can view their own quiz templates" ON quiz_templates FOR SELECT USING (auth.uid() = created_by);

  DROP POLICY IF EXISTS "Users can insert their own quiz templates" ON quiz_templates;
  CREATE POLICY "Users can insert their own quiz templates" ON quiz_templates FOR INSERT WITH CHECK (auth.uid() = created_by);

  DROP POLICY IF EXISTS "Users can update their own quiz templates" ON quiz_templates;
  CREATE POLICY "Users can update their own quiz templates" ON quiz_templates FOR UPDATE USING (auth.uid() = created_by);

  DROP POLICY IF EXISTS "Users can delete their own quiz templates" ON quiz_templates;
  CREATE POLICY "Users can delete their own quiz templates" ON quiz_templates FOR DELETE USING (auth.uid() = created_by);
END $$;
