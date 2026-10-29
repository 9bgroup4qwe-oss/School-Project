-- Consolidated Migration 002: Timetable Tables, Indexes, and RLS
-- Fixes critical vulnerability: removed WITH CHECK (true) from audit/history/analytics!

-- 1. Tables
CREATE TABLE IF NOT EXISTS user_timetables (
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

CREATE TABLE IF NOT EXISTS timetable_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES user_timetables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'shared', 'duplicated')),
  change_description TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_activities (
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

CREATE TABLE IF NOT EXISTS timetable_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES user_timetables(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(timetable_id, shared_with)
);

CREATE TABLE IF NOT EXISTS timetable_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES user_timetables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('viewed', 'created', 'updated', 'shared', 'exported', 'duplicated')),
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_user_timetables_user_id ON user_timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_active ON user_timetables(is_active);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_public ON user_timetables(is_public);
CREATE INDEX IF NOT EXISTS idx_timetable_history_timetable_id ON timetable_history(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_shares_timetable_id ON timetable_shares(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_analytics_timetable_id ON timetable_analytics(timetable_id);

-- 3. RLS
ALTER TABLE user_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_analytics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view accessible timetables" ON user_timetables;
  CREATE POLICY "Users can view accessible timetables" ON user_timetables FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = ANY(shared_with) OR is_public = true
  );

  DROP POLICY IF EXISTS "Users can insert their own timetables" ON user_timetables;
  CREATE POLICY "Users can insert their own timetables" ON user_timetables FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update their own timetables" ON user_timetables;
  CREATE POLICY "Users can update their own timetables" ON user_timetables FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete their own timetables" ON user_timetables;
  CREATE POLICY "Users can delete their own timetables" ON user_timetables FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Anyone can view public templates" ON timetable_templates;
  CREATE POLICY "Anyone can view public templates" ON timetable_templates FOR SELECT USING (is_public = true OR auth.uid() = created_by);

  DROP POLICY IF EXISTS "Users can view their timetable history" ON timetable_history;
  CREATE POLICY "Users can view their timetable history" ON timetable_history FOR SELECT USING (auth.uid() = user_id);

  -- Safe INSERT policies: must match authenticated user
  DROP POLICY IF EXISTS "Users can insert their own history" ON timetable_history;
  CREATE POLICY "Users can insert their own history" ON timetable_history FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Anyone can read activities" ON timetable_activities;
  CREATE POLICY "Anyone can read activities" ON timetable_activities FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can view their shares" ON timetable_shares;
  CREATE POLICY "Users can view their shares" ON timetable_shares FOR SELECT USING (auth.uid() = shared_by OR auth.uid() = shared_with);

  DROP POLICY IF EXISTS "Users can view their analytics" ON timetable_analytics;
  CREATE POLICY "Users can view their analytics" ON timetable_analytics FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own analytics" ON timetable_analytics;
  CREATE POLICY "Users can insert their own analytics" ON timetable_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
END $$;

-- Default activity types
INSERT INTO timetable_activities (activity_type, display_name, default_color, icon_name, category, sort_order) VALUES
('class', 'Class', '#537fe7', 'BookOpen', 'academic', 1),
('study', 'Study', '#ffe537', 'BookOpen', 'academic', 2),
('meal', 'Meal', '#ef4444', 'Coffee', 'personal', 3),
('break', 'Break', '#22c55e', 'Coffee', 'personal', 4),
('activity', 'Activity', '#f59e0b', 'Music', 'extracurricular', 5),
('personal', 'Personal', '#8b5cf6', 'Clock', 'personal', 6),
('exercise', 'Exercise', '#10b981', 'Dumbbell', 'health', 7),
('meeting', 'Meeting', '#f97316', 'Users', 'professional', 8),
('assignment', 'Assignment', '#06b6d4', 'FileText', 'academic', 9),
('exam', 'Exam', '#dc2626', 'AlertCircle', 'academic', 10)
ON CONFLICT (activity_type) DO NOTHING;
