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
    const type = searchParams.get('type') || 'overview';

    if (type === 'overview') {
      // Get overall statistics
      const { data: overview, error: overviewError } = await supabase
        .from('quiz_sessions')
        .select('status, score_percentage, subject, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (overviewError) {
        console.error('Overview fetch error:', overviewError);
        return NextResponse.json(
          { error: 'Failed to fetch overview statistics' },
          { status: 500 }
        );
      }

      // Calculate statistics
      const totalQuizzes = overview.length;
      const completedQuizzes = overview.filter(q => q.status === 'completed').length;
      const averageScore = completedQuizzes > 0
        ? overview.reduce((sum, q) => sum + (q.score_percentage || 0), 0) / completedQuizzes
        : 0;

      const lastQuiz = overview.find(q => q.status === 'completed');
      const recentActivity = overview.filter(
        q => new Date(q.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      // Get subject distribution
      const subjectCounts = overview.reduce((acc: any, q) => {
        acc[q.subject] = (acc[q.subject] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        totalQuizzes,
        completedQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        lastQuizDate: lastQuiz?.created_at || null,
        recentActivity,
        subjectDistribution: subjectCounts
      });
    }

    if (type === 'subjects') {
      // Get subject-wise statistics
      const { data: subjectStats, error: subjectError } = await supabase
        .from('user_subject_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('average_score', { ascending: false });

      if (subjectError) {
        console.error('Subject stats fetch error:', subjectError);
        return NextResponse.json(
          { error: 'Failed to fetch subject statistics' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        subjects: subjectStats
      });
    }

    if (type === 'chapters') {
      // Get chapter-wise statistics
      const { data: chapterStats, error: chapterError } = await supabase
        .from('user_chapter_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('accuracy_rate', { ascending: true });

      if (chapterError) {
        console.error('Chapter stats fetch error:', chapterError);
        return NextResponse.json(
          { error: 'Failed to fetch chapter statistics' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        chapters: chapterStats
      });
    }

    if (type === 'recent') {
      // Get recent quiz sessions with details
      const { data: recent, error: recentError } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          quiz_answers(count)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('Recent quiz fetch error:', recentError);
        return NextResponse.json(
          { error: 'Failed to fetch recent quizzes' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        recentQuizzes: recent
      });
    }

    return NextResponse.json(
      { error: 'Invalid stats type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Quiz stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}