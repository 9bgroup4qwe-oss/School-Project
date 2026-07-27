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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const difficulty = searchParams.get('difficulty');

    // Build base query
    let query = supabase
      .from('quiz_sessions')
      .select(`
        *,
        quiz_answers(count),
        quiz_questions(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (subject) {
      query = query.eq('subject', subject);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: sessions, error } = await query;

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz history' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (subject) {
      countQuery = countQuery.eq('subject', subject);
    }
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (difficulty) {
      countQuery = countQuery.eq('difficulty', difficulty);
    }

    const { count } = await countQuery;

    // Transform the data to include answer counts
    const transformedSessions = sessions.map((session: any) => ({
      ...session,
      questionsAnswered: session.quiz_answers[0]?.count || 0,
      totalQuestions: session.quiz_questions[0]?.count || 0
    }));

    // Get unique subjects, statuses, and difficulties for filters
    const { data: filters } = await supabase
      .from('quiz_sessions')
      .select('subject, status, difficulty')
      .eq('user_id', user.id);

    const uniqueSubjects = [...new Set(filters?.map(f => f.subject) || [])];
    const uniqueStatuses = [...new Set(filters?.map(f => f.status) || [])];
    const uniqueDifficulties = [...new Set(filters?.map(f => f.difficulty) || [])];

    return NextResponse.json({
      sessions: transformedSessions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        subjects: uniqueSubjects,
        statuses: uniqueStatuses,
        difficulties: uniqueDifficulties
      }
    });

  } catch (error) {
    console.error('Quiz history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}