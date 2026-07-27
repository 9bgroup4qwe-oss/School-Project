-- Function to update user subject stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_subject_stats(
    p_user_id UUID,
    p_subject TEXT,
    p_score DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_subject_stats (
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
        total_quizzes = user_subject_stats.total_quizzes + 1,
        last_quiz_date = NOW(),
        average_score = (
            (user_subject_stats.average_score * user_subject_stats.total_quizzes + p_score) /
            (user_subject_stats.total_quizzes + 1)
        ),
        best_score = GREATEST(user_subject_stats.best_score, p_score),
        recent_attempts = CASE
            WHEN user_subject_stats.last_quiz_date >= NOW() - INTERVAL '30 days'
            THEN user_subject_stats.recent_attempts + 1
            ELSE 1
        END;
END;
$$ LANGUAGE plpgsql;

-- Function to update user chapter stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_chapter_stats(
    p_user_id UUID,
    p_subject TEXT,
    p_chapter TEXT,
    p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_chapter_stats (
        user_id,
        subject,
        chapter,
        total_questions,
        correct_answers,
        accuracy_rate,
        weak_area,
        last_reviewed
    ) VALUES (
        p_user_id,
        p_subject,
        p_chapter,
        1,
        CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        CASE WHEN p_is_correct THEN 100 ELSE 0 END,
        CASE WHEN p_is_correct THEN FALSE ELSE TRUE END,
        NOW()
    )
    ON CONFLICT (user_id, subject, chapter) DO UPDATE SET
        total_questions = user_chapter_stats.total_questions + 1,
        correct_answers = user_chapter_stats.correct_answers + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        accuracy_rate = (
            (user_chapter_stats.correct_answers + CASE WHEN p_is_correct THEN 1 ELSE 0 END) * 100.0 /
            (user_chapter_stats.total_questions + 1)
        ),
        weak_area = (
            (user_chapter_stats.correct_answers + CASE WHEN p_is_correct THEN 1 ELSE 0 END) * 100.0 /
            (user_chapter_stats.total_questions + 1)
        ) < 60,
        last_reviewed = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to complete a quiz session and update stats
CREATE OR REPLACE FUNCTION complete_quiz_session(
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
    SELECT * INTO v_session FROM quiz_sessions WHERE id = p_session_id;

    -- Calculate results
    SELECT COUNT(*) INTO v_total_questions
    FROM quiz_questions
    WHERE session_id = p_session_id;

    SELECT COUNT(*) INTO v_correct_count
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qq.id = qa.question_id
    WHERE qa.session_id = p_session_id AND qa.is_correct = true;

    v_score := CASE
        WHEN v_total_questions > 0
        THEN (v_correct_count * 100.0 / v_total_questions)
        ELSE 0
    END;

    -- Update quiz session
    UPDATE quiz_sessions SET
        completed_at = NOW(),
        total_questions = v_total_questions,
        correct_answers = v_correct_count,
        score_percentage = v_score,
        status = 'completed'
    WHERE id = p_session_id;

    -- Update subject stats
    PERFORM update_user_subject_stats(v_session.user_id, v_session.subject, v_score);

    -- Update chapter stats for all questions in the quiz
    INSERT INTO user_chapter_stats (
        user_id,
        subject,
        chapter,
        total_questions,
        correct_answers,
        accuracy_rate,
        weak_area,
        last_reviewed
    )
    SELECT
        v_session.user_id,
        qq.chapter,
        qq.chapter,
        COUNT(*) FILTER (WHERE qa.is_correct = true),
        COUNT(*) FILTER (WHERE qa.is_correct = false),
        (COUNT(*) FILTER (WHERE qa.is_correct = true) * 100.0 / COUNT(*)),
        (COUNT(*) FILTER (WHERE qa.is_correct = true) * 100.0 / COUNT(*)) < 60,
        NOW()
    FROM quiz_questions qq
    LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
    WHERE qq.session_id = p_session_id
    GROUP BY qq.chapter
    ON CONFLICT (user_id, subject, chapter) DO UPDATE SET
        total_questions = user_chapter_stats.total_questions + EXCLUDED.total_questions,
        correct_answers = user_chapter_stats.correct_answers + EXCLUDED.correct_answers,
        accuracy_rate = (
            (user_chapter_stats.correct_answers + EXCLUDED.correct_answers) * 100.0 /
            (user_chapter_stats.total_questions + EXCLUDED.total_questions)
        ),
        weak_area = (
            (user_chapter_stats.correct_answers + EXCLUDED.correct_answers) * 100.0 /
            (user_chapter_stats.total_questions + EXCLUDED.total_questions)
        ) < 60,
        last_reviewed = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to generate a question hash for deduplication
CREATE OR REPLACE FUNCTION generate_question_hash(
    p_question_text TEXT,
    p_options JSONB,
    p_correct_answer INTEGER
)
RETURNS TEXT AS $$
BEGIN
    RETURN md5(p_question_text || p_options::text || p_correct_answer::text);
END;
$$ LANGUAGE plpgsql;