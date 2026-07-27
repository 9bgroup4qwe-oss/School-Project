import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query for incorrect answers
    let query = supabase
      .from('quiz_answers')
      .select(`
        *,
        quiz_questions!inner(
          question_text,
          options,
          correct_answer,
          explanation,
          subject,
          chapter,
          difficulty,
          quiz_sessions!inner(user_id)
        )
      `)
      .eq('is_correct', false)
      .eq('quiz_questions.quiz_sessions.user_id', user.id)
      .order('answered_at', { ascending: false });

    // Apply filters
    if (subject) {
      query = query.eq('quiz_questions.subject', subject);
    }
    if (chapter) {
      query = query.eq('quiz_questions.chapter', chapter);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: mistakes, error } = await query;

    if (error) {
      console.error('Mistakes fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mistakes' },
        { status: 500 }
      );
    }

    // Transform the data
    const transformedMistakes = mistakes.map((mistake: any) => ({
      id: mistake.id,
      sessionId: mistake.session_id,
      questionId: mistake.question_id,
      question: {
        text: mistake.quiz_questions.question_text,
        options: mistake.quiz_questions.options,
        correctAnswer: mistake.quiz_questions.correct_answer,
        explanation: mistake.quiz_questions.explanation,
        subject: mistake.quiz_questions.subject,
        chapter: mistake.quiz_questions.chapter,
        difficulty: mistake.quiz_questions.difficulty
      },
      userAnswer: {
        selectedOption: mistake.selected_option,
        isCorrect: mistake.is_correct,
        timeTaken: mistake.time_taken,
        answeredAt: mistake.answered_at
      }
    }));

    // Get total count for pagination
    let countQuery = supabase
      .from('quiz_answers')
      .select('quiz_questions!inner(subject, chapter, quiz_sessions!inner(user_id))', { count: 'exact', head: true })
      .eq('is_correct', false)
      .eq('quiz_questions.quiz_sessions.user_id', user.id);

    if (subject) {
      countQuery = countQuery.eq('quiz_questions.subject', subject);
    }
    if (chapter) {
      countQuery = countQuery.eq('quiz_questions.chapter', chapter);
    }

    const { count } = await countQuery;

    // Get unique subjects and chapters for filters
    const { data: subjects } = await supabase
      .from('quiz_answers')
      .select('quiz_questions!inner(subject)')
      .eq('is_correct', false)
      .eq('quiz_questions.quiz_sessions.user_id', user.id);

    const uniqueSubjects = [...new Set(subjects?.map((s: any) => s.quiz_questions.subject) || [])];

    return NextResponse.json({
      mistakes: transformedMistakes,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        subjects: uniqueSubjects
      }
    });

  } catch (error) {
    console.error('Quiz mistakes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}