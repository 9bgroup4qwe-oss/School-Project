'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QuizStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
  recentActivity: number;
  subjectBreakdown: {
    [key: string]: {
      total: number;
      average: number;
      best: number;
      recent: number;
    };
  };
  recentQuizzes: Array<{
    id: string;
    subject: string;
    score: number;
    date: string;
    status: string;
  }>;
  weakAreas: Array<{
    subject: string;
    chapter: string;
    accuracy: number;
  }>;
}

export function QuizStatistics() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const supabase = createClient();

  useEffect(() => {
    fetchQuizStats();

    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchQuizStats, 30000); // Refresh every 30 seconds

    // Set up real-time subscription for quiz sessions
    const channel = supabase
      .channel('quiz_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions'
        },
        () => {
          fetchQuizStats(); // Refresh when quiz data changes
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQuizStats = async () => {
    try {
      setError(null);

      // Fetch overview statistics
      const statsResponse = await fetch('/api/quiz/stats?type=overview');
      const statsData = await statsResponse.json();

      // Fetch recent quizzes
      const recentResponse = await fetch('/api/quiz/stats?type=recent');
      const recentData = await recentResponse.json();

      // Fetch weak areas
      const weakResponse = await fetch('/api/quiz/mistakes?limit=5');
      const weakData = await weakResponse.json();

      // Combine data
      const combinedStats: QuizStats = {
        ...statsData,
        recentQuizzes: recentData?.recentQuizzes || [],
        weakAreas: weakData?.mistakes || []
      };

      setStats(combinedStats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching quiz stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! 🏆';
    if (score >= 80) return 'Great work! ⭐';
    if (score >= 70) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dark-card p-6 fade-in-up">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark-card p-6 fade-in-up">
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400">{error}</p>
          <Button
            onClick={fetchQuizStats}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Card */}
      <Card className="dark-card p-6 fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quiz Performance
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQuizStats}
              disabled={loading}
              className="text-gray-400 hover:text-white disabled:opacity-50"
            >
              {loading ? '...' : '↻'}
            </Button>
          </div>
        </div>

        {stats?.totalQuizzes > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
                <p className="text-sm text-gray-400">Total Quizzes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.completedQuizzes}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {Math.round(stats.averageScore)}%
                </p>
                <p className="text-sm text-gray-400">Average Score</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>
                  {Math.round(stats.bestScore)}%
                </p>
                <p className="text-sm text-gray-400">Best Score</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-6">
              <p className="text-center text-white font-medium">
                {getScoreMessage(stats.averageScore)}
              </p>
            </div>

            {/* Subject Breakdown */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-4">Performance by Subject</h4>
              <div className="space-y-3">
                {Object.entries(stats.subjectBreakdown || {}).map(([subject, data]) => (
                  <div key={subject} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{subject}</p>
                      <p className="text-sm text-gray-400">
                        {data.recent} recent quiz{data.recent !== 1 ? 'zes' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getScoreColor(data.average)}`}>
                        {Math.round(data.average)}%
                      </p>
                      <p className="text-xs text-gray-400">avg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">No quizzes completed yet</p>
            <Button
              onClick={() => window.location.href = '/quizzer'}
              className="mt-4"
            >
              Take Your First Quiz
            </Button>
          </div>
          )}
      </Card>

      {/* Recent Quizzes */}
      {stats?.recentQuizzes && stats.recentQuizzes.length > 0 && (
        <Card className="dark-card p-6 fade-in-up">
          <h3 className="card-title mb-4">Recent Quizzes</h3>
          <div className="space-y-3">
            {(showAll ? stats.recentQuizzes : stats.recentQuizzes.slice(0, 3)).map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="text-white font-medium">{quiz.subject}</p>
                  <p className="text-sm text-gray-400">{formatDate(quiz.date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-right`}>
                    <p className={`font-bold ${getScoreColor(quiz.score)}`}>
                      {Math.round(quiz.score)}%
                    </p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                  {quiz.status === 'completed' ? (
                    <Award className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {stats.recentQuizzes.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center text-gray-400 hover:text-white"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </Card>
      )}

      {/* Weak Areas */}
      {stats?.weakAreas && stats.weakAreas.length > 0 && (
        <Card className="dark-card p-6 fade-in-up">
          <h3 className="card-title mb-4">Areas to Improve</h3>
          <div className="space-y-3">
            {stats.weakAreas.slice(0, 3).map((area, index) => (
              <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-yellow-300 font-medium">{area.chapter}</p>
                  <span className="text-sm text-yellow-400">
                    {Math.round(area.accuracy)}% accuracy
                  </span>
                </div>
                <p className="text-sm text-gray-400">Subject: {area.subject}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/quizzer'}
                  className="text-xs text-yellow-300 hover:text-yellow-200"
                >
                  Practice More
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="dark-card p-6 fade-in-up">
        <h3 className="card-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => window.location.href = '/quizzer'}
            className="flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            New Quiz
          </Button>
          <Button
            onClick={() => window.location.href = '/quiz/history'}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            History
          </Button>
        </div>
      </Card>
    </div>
  );
}