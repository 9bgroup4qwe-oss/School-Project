import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
    const { sessionId, questions } = body;

    if (!sessionId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Prepare questions for insertion
    const questionsToInsert = questions.map((q: any, index: number) => {
      // Generate question hash for deduplication
      const hash = crypto.createHash('md5');
      hash.update(q.question + JSON.stringify(q.options) + q.correctAnswer.toString());
      const questionHash = hash.digest('hex');

      return {
        session_id: sessionId,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        explanation: q.explanation || null,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        question_hash: questionHash,
        question_index: index
      };
    });

    // Insert questions
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select()
      .order('question_index', { ascending: true });

    if (insertError) {
      console.error('Questions insertion error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save quiz questions' },
        { status: 500 }
      );
    }

    // Update session with total questions count
    await supabase
      .from('quiz_sessions')
      .update({ total_questions: questions.length })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      questions: insertedQuestions
    });

  } catch (error) {
    console.error('Quiz questions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}