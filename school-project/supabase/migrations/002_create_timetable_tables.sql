-- ========================================
-- Timetable System Tables Migration
-- ========================================
-- Run this in your Supabase SQL Editor: https://app.supabase.com
-- Project: ibmdiynievtxkucgrkun
-- ========================================

-- Create user_timetables table
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
  shared_with UUID[] DEFAULT '{}', -- Array of user IDs
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetable_templates table
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

-- Create timetable_history table
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

-- Create timetable_activities reference table
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

-- Create timetable_shares table for sharing permissions
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

-- Create timetable_analytics table
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

-- ========================================
-- Indexes for Performance
-- ========================================

-- user_timetables indexes
CREATE INDEX IF NOT EXISTS idx_user_timetables_user_id ON user_timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_active ON user_timetables(is_active);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_favorite ON user_timetables(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_timetables_is_public ON user_timetables(is_public);
CREATE INDEX IF NOT EXISTS idx_user_timetables_share_token ON user_timetables(share_token);
CREATE INDEX IF NOT EXISTS idx_user_timetables_created_at ON user_timetables(created_at DESC);

-- timetable_templates indexes
CREATE INDEX IF NOT EXISTS idx_timetable_templates_is_public ON timetable_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_timetable_templates_category ON timetable_templates(category);
CREATE INDEX IF NOT EXISTS idx_timetable_templates_created_by ON timetable_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_timetable_templates_usage_count ON timetable_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_timetable_templates_rating ON timetable_templates(rating DESC);

-- timetable_history indexes
CREATE INDEX IF NOT EXISTS idx_timetable_history_timetable_id ON timetable_history(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_history_user_id ON timetable_history(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_history_change_type ON timetable_history(change_type);
CREATE INDEX IF NOT EXISTS idx_timetable_history_changed_at ON timetable_history(changed_at DESC);

-- timetable_shares indexes
CREATE INDEX IF NOT EXISTS idx_timetable_shares_timetable_id ON timetable_shares(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_shares_shared_by ON timetable_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_timetable_shares_shared_with ON timetable_shares(shared_with);

-- timetable_analytics indexes
CREATE INDEX IF NOT EXISTS idx_timetable_analytics_timetable_id ON timetable_analytics(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_analytics_user_id ON timetable_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_analytics_event_type ON timetable_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_timetable_analytics_created_at ON timetable_analytics(created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_analytics ENABLE ROW LEVEL SECURITY;

-- user_timetables RLS policies
CREATE POLICY "Users can view their own timetables" ON user_timetables
    FOR SELECT USING (
      auth.uid() = user_id OR
      auth.uid() = ANY(shared_with) OR
      is_public = true
    );

CREATE POLICY "Users can insert their own timetables" ON user_timetables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetables" ON user_timetables
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetables" ON user_timetables
    FOR DELETE USING (auth.uid() = user_id);

-- timetable_templates RLS policies
CREATE POLICY "Anyone can view public templates" ON timetable_templates
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can manage their templates" ON timetable_templates
    FOR ALL USING (auth.uid() = created_by);

-- timetable_history RLS policies
CREATE POLICY "Users can view their timetable history" ON timetable_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert history" ON timetable_history
    FOR INSERT WITH CHECK (true);

-- timetable_shares RLS policies
CREATE POLICY "Users can view their shares" ON timetable_shares
    FOR SELECT USING (
      auth.uid() = shared_by OR
      auth.uid() = shared_with
    );

CREATE POLICY "Users can create shares" ON timetable_shares
    FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete their shares" ON timetable_shares
    FOR DELETE USING (auth.uid() = shared_by);

-- timetable_analytics RLS policies
CREATE POLICY "Users can view their analytics" ON timetable_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON timetable_analytics
    FOR INSERT WITH CHECK (true);

-- ========================================
-- Triggers and Functions
-- ========================================

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'hex');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM user_timetables WHERE share_token = token);
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log timetable changes
CREATE OR REPLACE FUNCTION log_timetable_change()
RETURNS TRIGGER AS $$
DECLARE
  change_desc TEXT;
  changed_fields TEXT[] := '{}';
BEGIN
  IF TG_OP = 'INSERT' THEN
    change_desc := 'Created timetable "' || COALESCE(NEW.title, 'Untitled') || '"';
    INSERT INTO timetable_history (
      timetable_id,
      user_id,
      change_type,
      change_description,
      new_data
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'created',
      change_desc,
      row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    change_desc := 'Updated timetable "' || COALESCE(NEW.title, 'Untitled') || '"';

    -- Build array of changed fields
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      changed_fields := array_append(changed_fields, 'title');
    END IF;
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      changed_fields := array_append(changed_fields, 'description');
    END IF;
    IF OLD.schedule IS DISTINCT FROM NEW.schedule THEN
      changed_fields := array_append(changed_fields, 'schedule');
    END IF;
    IF OLD.settings IS DISTINCT FROM NEW.settings THEN
      changed_fields := array_append(changed_fields, 'settings');
    END IF;
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
      changed_fields := array_append(changed_fields, 'is_active');
    END IF;

    INSERT INTO timetable_history (
      timetable_id,
      user_id,
      change_type,
      change_description,
      old_data,
      new_data,
      changed_fields
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'updated',
      change_desc,
      row_to_json(OLD),
      row_to_json(NEW),
      changed_fields
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    change_desc := 'Deleted timetable "' || COALESCE(OLD.title, 'Untitled') || '"';
    INSERT INTO timetable_history (
      timetable_id,
      user_id,
      change_type,
      change_description,
      old_data
    ) VALUES (
      OLD.id,
      OLD.user_id,
      'deleted',
      change_desc,
      row_to_json(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER log_user_timetables_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_timetables
  FOR EACH ROW EXECUTE FUNCTION log_timetable_change();

-- Function to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timetable_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = NEW.template_data->>'template_id';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Initial Data
-- ========================================

-- Insert default activity types
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

-- ========================================
-- Migration Complete!
-- ========================================
-- All timetable tables have been created successfully!