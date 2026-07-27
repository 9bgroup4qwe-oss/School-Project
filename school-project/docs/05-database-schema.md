# Learn.ai - Database Schema Documentation

## 🗄️ Database Overview

The Learn.ai platform uses Supabase (PostgreSQL) as its primary database, leveraging Row Level Security (RLS) for data isolation and automatic API generation.

### Database Design Principles
- **Data Isolation:** Each user can only access their own data
- **Performance:** Optimized queries with proper indexing
- **Scalability:** Designed to handle growth and increasing user base
- **Security:** Row Level Security (RLS) policies enforced
- **Integrity:** Foreign key constraints and data validation

---

## 📋 Core Tables Schema

### 1. Users Table (`profiles`)
**Purpose:** Store user profile information and preferences

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 12),
    school_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_profiles_grade_level ON profiles(grade_level);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
```

**Preferences JSONB Schema:**
```json
{
  "theme": "light" | "dark",
  "notifications_enabled": boolean,
  "study_reminders": boolean,
  "quiz_reminders": boolean,
  "reminder_time": "HH:MM",
  "language": "en",
  "timezone": "UTC"
}
```

### 2. Subjects Table (`subjects`)
**Purpose:** Store NCERT subject information

```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    ncert_code TEXT UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subjects_grade_level ON subjects(grade_level);
CREATE INDEX idx_subjects_active ON subjects(is_active);
CREATE UNIQUE INDEX idx_subjects_grade_name ON subjects(grade_level, name);
```

### 3. Chapters Table (`chapters`)
**Purpose:** Store chapter information for each subject

```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    description TEXT,
    estimated_hours INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_chapters_active ON chapters(is_active);
CREATE UNIQUE INDEX idx_chapters_subject_number ON chapters(subject_id, chapter_number);
```

### 4. Topics Table (`topics`)
**Purpose:** Store detailed topics within chapters

```sql
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    prerequisites UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX idx_topics_difficulty ON topics(difficulty_level);
CREATE INDEX idx_topics_prerequisites ON topics USING GIN(prerequisites);
```

### 5. Questions Table (`questions`)
**Purpose:** Store AI-generated quiz questions

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'multi_select', 'match', 'paragraph')),
    question_text TEXT NOT NULL,
    options JSONB, -- For MCQ and multi-select questions
    correct_answer TEXT, -- For MCQ and paragraph questions
    correct_answers JSONB, -- For multi-select and match questions
    explanation TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_created_at ON questions(created_at);
```

**Examples of Question Storage:**

**MCQ Question:**
```json
{
  "question_type": "mcq",
  "question_text": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correct_answer": "Paris",
  "explanation": "Paris is the capital and most populous city of France."
}
```

**Multi-select Question:**
```json
{
  "question_type": "multi_select",
  "question_text": "Which of the following are primary colors?",
  "options": ["Red", "Green", "Blue", "Yellow", "Purple"],
  "correct_answers": ["Red", "Green", "Blue"],
  "explanation": "Red, Green, and Blue are the primary colors of light."
}
```

### 6. Quiz Attempts Table (`quiz_attempts`)
**Purpose:** Track user quiz attempts

```sql
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('short', 'medium', 'long', 'custom')),
    questions UUID[], -- Array of question IDs
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL,
    time_taken INTEGER, -- Time in seconds
    completed_at TIMESTAMP WITH TIME ZONE,
    is_retry BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_type ON quiz_attempts(quiz_type);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX idx_quiz_attempts_score ON quiz_attempts(score);
```

### 7. User Answers Table (`user_answers`)
**Purpose:** Store detailed user responses to questions

```sql
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    user_answers JSONB, -- For multi-select and match questions
    is_correct BOOLEAN,
    time_spent INTEGER, -- Time in seconds
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_answers_quiz_attempt ON user_answers(quiz_attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_correct ON user_answers(is_correct);
```

### 8. Study Progress Table (`study_progress`)
**Purpose:** Track user progress through topics

```sql
CREATE TABLE study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    time_spent INTEGER DEFAULT 0, -- Time in minutes
    last_studied TIMESTAMP WITH TIME ZONE,
    understanding_level INTEGER CHECK (understanding_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one progress record per user per topic
    UNIQUE(user_id, topic_id)
);

-- Indexes
CREATE INDEX idx_study_progress_user_id ON study_progress(user_id);
CREATE INDEX idx_study_progress_topic_id ON study_progress(topic_id);
CREATE INDEX idx_study_progress_status ON study_progress(status);
CREATE INDEX idx_study_progress_completion ON study_progress(completion_percentage);
```

### 9. Study Plans Table (`study_plans`)
**Purpose:** Store user-created study plans

```sql
CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_goals JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX idx_study_plans_active ON study_plans(is_active);
CREATE INDEX idx_study_plans_dates ON study_plans(start_date, end_date);
```

**Target Goals JSONB Schema:**
```json
{
  "subject_goals": {
    "Mathematics": 90,
    "Science": 85,
    "English": 88
  },
  "daily_study_hours": 2,
  "weekly_topics": 5
}
```

### 10. Study Sessions Table (`study_sessions`)
**Purpose:** Log individual study sessions

```sql
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    study_plan_id UUID REFERENCES study_plans(id) ON DELETE SET NULL,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- Duration in minutes
    notes TEXT,
    session_type TEXT NOT NULL CHECK (session_type IN ('planned', 'spontaneous')),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_plan_id ON study_sessions(study_plan_id);
CREATE INDEX idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX idx_study_sessions_completed_at ON study_sessions(completed_at);
```

### 11. User Streaks Table (`user_streaks`)
**Purpose:** Track user study streaks and consistency

```sql
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity_date DATE,
    streak_freeze_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one streak record per user
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_current ON user_streaks(current_streak);
```

### 12. Notifications Table (`notifications`)
**Purpose:** Store user notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('quiz_reminder', 'study_reminder', 'achievement', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
```

---

## 🔒 Row Level Security (RLS) Policies

### Authentication Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own study progress
CREATE POLICY "Users can view own study progress" ON study_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own study progress
CREATE POLICY "Users can update own study progress" ON study_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for all user-specific tables...
```

### Content Access Policies
```sql
-- Users can view subjects for their grade level
CREATE POLICY "Users can view grade-level subjects" ON subjects
    FOR SELECT USING (grade_level IN (SELECT grade_level FROM profiles WHERE id = auth.uid()));

-- Users can view chapters for their grade level subjects
CREATE POLICY "Users can view grade-level chapters" ON chapters
    FOR SELECT USING (
        subject_id IN (
            SELECT id FROM subjects
            WHERE grade_level IN (SELECT grade_level FROM profiles WHERE id = auth.uid())
        )
    );

-- Users can view topics for their grade level
CREATE POLICY "Users can view grade-level topics" ON topics
    FOR SELECT USING (
        chapter_id IN (
            SELECT id FROM chapters
            WHERE subject_id IN (
                SELECT id FROM subjects
                WHERE grade_level IN (SELECT grade_level FROM profiles WHERE id = auth.uid())
            )
        )
    );

-- Users can view questions for their grade level
CREATE POLICY "Users can view grade-level questions" ON questions
    FOR SELECT USING (
        topic_id IN (
            SELECT id FROM topics
            WHERE chapter_id IN (
                SELECT id FROM chapters
                WHERE subject_id IN (
                    SELECT id FROM subjects
                    WHERE grade_level IN (SELECT grade_level FROM profiles WHERE id = auth.uid())
                )
            )
        )
    );
```

---

## 📊 Database Functions and Triggers

### 1. Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at BEFORE UPDATE ON study_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Calculate Quiz Score Function
```sql
CREATE OR REPLACE FUNCTION calculate_quiz_score(
    p_quiz_attempt_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_total INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM user_answers
    WHERE quiz_attempt_id = p_quiz_attempt_id;

    SELECT COUNT(*) INTO v_score
    FROM user_answers
    WHERE quiz_attempt_id = p_quiz_attempt_id AND is_correct = true;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Study Streak Function
```sql
CREATE OR REPLACE FUNCTION update_study_streak(
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := v_today - INTERVAL '1 day';
BEGIN
    -- Get last activity date
    SELECT COALESCE(MAX(last_activity_date), '1970-01-01'::DATE)
    INTO v_last_activity
    FROM user_streaks
    WHERE user_id = p_user_id;

    -- Update or create streak record
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, v_today)
    ON CONFLICT (user_id) DO UPDATE SET
        last_activity_date = v_today,
        current_streak = CASE
            WHEN v_last_activity = v_yesterday THEN user_streaks.current_streak + 1
            WHEN v_last_activity = v_today THEN user_streaks.current_streak
            ELSE 1
        END,
        longest_streak = GREATEST(
            CASE
                WHEN v_last_activity = v_yesterday THEN user_streaks.current_streak + 1
                WHEN v_last_activity = v_today THEN user_streaks.current_streak
                ELSE 1
            END,
            user_streaks.longest_streak
        );
END;
$$ LANGUAGE plpgsql;
```

### 4. Get User Progress Summary Function
```sql
CREATE OR REPLACE FUNCTION get_user_progress_summary(
    p_user_id UUID
) RETURNS TABLE (
    subject_name TEXT,
    completed_topics INTEGER,
    total_topics INTEGER,
    completion_percentage NUMERIC,
    time_spent INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.name as subject_name,
        COUNT(CASE WHEN sp.status = 'completed' THEN 1 END) as completed_topics,
        COUNT(t.id) as total_topics,
        ROUND(
            COUNT(CASE WHEN sp.status = 'completed' THEN 1 END) * 100.0 /
            NULLIF(COUNT(t.id), 0), 2
        ) as completion_percentage,
        COALESCE(SUM(sp.time_spent), 0) as time_spent
    FROM subjects s
    LEFT JOIN chapters c ON s.id = c.subject_id
    LEFT JOIN topics t ON c.id = t.chapter_id
    LEFT JOIN study_progress sp ON t.id = sp.topic_id AND sp.user_id = p_user_id
    WHERE s.grade_level = (SELECT grade_level FROM profiles WHERE id = p_user_id)
    AND s.is_active = true
    GROUP BY s.id, s.name
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Performance Optimization

### Indexes for Common Queries
```sql
-- Composite indexes for dashboard queries
CREATE INDEX idx_study_progress_user_status ON study_progress(user_id, status);
CREATE INDEX idx_quiz_attempts_user_completed ON quiz_attempts(user_id, completed_at DESC);
CREATE INDEX idx_study_sessions_user_completed ON study_sessions(user_id, completed_at DESC);

-- JSONB indexes for filtering
CREATE INDEX idx_profiles_preferences ON profiles USING GIN(preferences);
CREATE INDEX idx_study_plans_goals ON study_plans USING GIN(target_goals);

-- Full-text search for content
CREATE INDEX idx_questions_search ON questions USING GIN(to_tsvector('english', question_text));
CREATE INDEX idx_topics_search ON topics USING GIN(to_tsvector('english', content));
```

### Materialized Views for Analytics
```sql
CREATE MATERIALIZED VIEW user_analytics_mv AS
SELECT
    p.id as user_id,
    p.grade_level,
    COUNT(DISTINCT qa.id) as total_quizzes,
    COALESCE(AVG(qa.score * 100.0 / qa.total_questions), 0) as average_score,
    COUNT(DISTINCT sp.topic_id) as topics_started,
    COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.topic_id END) as topics_completed,
    COALESCE(SUM(ss.duration), 0) as total_study_minutes,
    COALESCE(us.current_streak, 0) as current_streak,
    COALESCE(us.longest_streak, 0) as longest_streak
FROM profiles p
LEFT JOIN quiz_attempts qa ON p.id = qa.user_id
LEFT JOIN study_progress sp ON p.id = sp.user_id
LEFT JOIN study_sessions ss ON p.id = ss.user_id
LEFT JOIN user_streaks us ON p.id = us.user_id
GROUP BY p.id, p.grade_level, us.current_streak, us.longest_streak;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_user_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW user_analytics_mv;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (can be done via cron job or Supabase scheduler)
```

---

## 🔄 Database Migration Strategy

### Migration Naming Convention
- `001_initial_schema.sql` - Initial database setup
- `002_add_rls_policies.sql` - Row Level Security policies
- `003_add_functions_triggers.sql` - Database functions and triggers
- `004_performance_optimization.sql` - Indexes and materialized views

### Rollback Strategy
- All migrations include rollback scripts
- Use transactions for complex migrations
- Test migrations in staging environment first
- Backup database before major migrations

---

## 📊 Data Backup and Recovery

### Automated Backups
- **Daily Backups:** Automated via Supabase
- **Point-in-Time Recovery:** Available for 7 days
- **Manual Backups:** Before major changes
- **Export Capability:** Data export functionality

### Disaster Recovery
- **Geographic Redundancy:** Multi-region replication
- **Automated Failover:** High availability setup
- **Data Validation:** Regular integrity checks
- **Recovery Testing:** Quarterly recovery drills

---

**Last Updated:** September 30, 2024
**Next Review:** Upon schema changes