-- Enable Row Level Security on all quiz tables
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subject_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chapter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions" ON quiz_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for quiz_questions
CREATE POLICY "Users can view questions from their sessions" ON quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_questions.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions for their sessions" ON quiz_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_questions.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Policies for quiz_answers
CREATE POLICY "Users can view their own quiz answers" ON quiz_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_answers.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quiz answers" ON quiz_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_answers.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own quiz answers" ON quiz_answers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = quiz_answers.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

-- Policies for user_subject_stats
CREATE POLICY "Users can view their own subject stats" ON user_subject_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subject stats" ON user_subject_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subject stats" ON user_subject_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_chapter_stats
CREATE POLICY "Users can view their own chapter stats" ON user_chapter_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chapter stats" ON user_chapter_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapter stats" ON user_chapter_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for quiz_templates
CREATE POLICY "Anyone can view public quiz templates" ON quiz_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own quiz templates" ON quiz_templates
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own quiz templates" ON quiz_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quiz templates" ON quiz_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quiz templates" ON quiz_templates
    FOR DELETE USING (auth.uid() = created_by);