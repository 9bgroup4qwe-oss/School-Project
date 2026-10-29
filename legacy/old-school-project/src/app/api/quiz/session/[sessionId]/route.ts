import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = params.sessionId;

    // Get quiz session details
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Get quiz questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index', { ascending: true });

    if (questionsError) {
      console.error('Questions fetch error:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch quiz questions' },
        { status: 500 }
      );
    }

    // Get user answers
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('answered_at', { ascending: true });

    if (answersError) {
      console.error('Answers fetch error:', answersError);
      return NextResponse.json(
        { error: 'Failed to fetch quiz answers' },
        { status: 500 }
      );
    }

    // Combine questions with answers
    const questionsWithAnswers = questions.map(question => {
      const answer = answers.find(a => a.question_id === question.id);
      return {
        ...question,
        userAnswer: answer || null
      };
    });

    return NextResponse.json({
      session,
      questions: questionsWithAnswers,
      answers
    });

  } catch (error) {
    console.error('Quiz session detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = params.sessionId;
    const body = await request.json();
    const { status, timeTaken } = body;

    // Update quiz session
    const { data: session, error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        status: status || 'completed',
        time_taken: timeTaken,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quiz session' },
        { status: 500 }
      );
    }

    // If completing the quiz, update stats
    if (status === 'completed') {
      const { error: statsError } = await supabase
        .rpc('complete_quiz_session', { p_session_id: sessionId });

      if (statsError) {
        console.error('Stats update error:', statsError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Quiz session update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}