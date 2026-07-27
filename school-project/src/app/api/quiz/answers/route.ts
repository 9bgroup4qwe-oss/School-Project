import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, questionId, selectedOption, isCorrect, timeTaken } = body;

    // Validate required fields
    if (!sessionId || !questionId || selectedOption === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the session and question belong to the user
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        session_id,
        quiz_sessions!inner(user_id)
      `)
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .single();

    if (questionError || !question || (question as any).quiz_sessions.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Question not found or unauthorized' },
        { status: 404 }
      );
    }

    // Insert or update answer
    const { data: answer, error: answerError } = await supabase
      .from('quiz_answers')
      .upsert({
        session_id: sessionId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_taken: timeTaken || 0
      }, {
        onConflict: 'session_id,question_id'
      })
      .select()
      .single();

    if (answerError) {
      console.error('Answer save error:', answerError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      answer
    });

  } catch (error) {
    console.error('Quiz answers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get all answers for the session
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('answered_at', { ascending: true });

    if (answersError) {
      console.error('Answers fetch error:', answersError);
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answers
    });

  } catch (error) {
    console.error('Quiz answers fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}