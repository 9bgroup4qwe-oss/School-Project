'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, CheckCircle, Clock, BookOpen, Target, TrendingUp, Calendar } from 'lucide-react';
import { TimetableData, TimetableSlot } from '@/types/timetable';

interface ProgressTrackerProps {
  timetable: TimetableData;
  onProgressUpdate?: (data: ProgressData) => void;
}

interface ProgressData {
  totalActivities: number;
  completedActivities: number;
  totalStudyHours: number;
  completedStudyHours: number;
  weeklyProgress: WeekProgress[];
  subjectProgress: SubjectProgress[];
  streakDays: number;
}

interface WeekProgress {
  day: string;
  completed: number;
  total: number;
  percentage: number;
}

interface SubjectProgress {
  subject: string;
  totalHours: number;
  completedHours: number;
  percentage: number;
  activities: ActivityProgress[];
}

interface ActivityProgress {
  activity: string;
  completed: boolean;
  time: string;
  type: string;
}

export function ProgressTracker({ timetable, onProgressUpdate }: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`timetable_progress_${timetable.id}`);
    if (savedProgress) {
      setProgressData(JSON.parse(savedProgress));
    } else {
      calculateInitialProgress();
    }
  }, [timetable]);

  // Calculate initial progress
  const calculateInitialProgress = () => {
    const data: ProgressData = {
      totalActivities: 0,
      completedActivities: 0,
      totalStudyHours: 0,
      completedStudyHours: 0,
      weeklyProgress: [],
      subjectProgress: [],
      streakDays: 0
    };

    // Calculate weekly progress
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      const daySchedule = timetable.schedule[day.toLowerCase()];
      if (daySchedule) {
        const total = daySchedule.length;
        let completed = 0;
        let studyHours = 0;

        daySchedule.forEach(slot => {
          data.totalActivities++;

          // Calculate hours from time slot
          const [start, end] = slot.time.split('-');
          const [startHour] = start.split(':').map(Number);
          const [endHour] = end.split(':').map(Number);
          const duration = endHour - startHour;

          if (slot.type === 'study') {
            data.totalStudyHours += duration;
            studyHours += duration;
          }

          // Check if activity is marked as complete (in a real app, this would come from user input)
          const isCompleted = checkIfActivityCompleted(day, slot.time);
          if (isCompleted) {
            data.completedActivities++;
            if (slot.type === 'study') {
              data.completedStudyHours += duration;
            }
          }
        });

        data.weeklyProgress.push({
          day,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });
      }
    });

    // Calculate subject progress
    const subjectMap = new Map<string, SubjectProgress>();

    Object.entries(timetable.schedule).forEach(([day, slots]) => {
      slots.forEach(slot => {
        if (slot.type === 'study') {
          const subject = slot.activity;
          if (!subjectMap.has(subject)) {
            subjectMap.set(subject, {
              subject,
              totalHours: 0,
              completedHours: 0,
              percentage: 0,
              activities: []
            });
          }

          const subjectData = subjectMap.get(subject)!;
          const [start, end] = slot.time.split('-');
          const [startHour] = start.split(':').map(Number);
          const [endHour] = end.split(':').map(Number);
          const duration = endHour - startHour;

          subjectData.totalHours += duration;

          const isCompleted = checkIfActivityCompleted(day, slot.time);
          if (isCompleted) {
            subjectData.completedHours += duration;
          }

          subjectData.activities.push({
            activity: slot.activity,
            completed: isCompleted,
            time: slot.time,
            type: slot.type
          });
        }
      });
    });

    // Calculate percentages
    subjectMap.forEach(subject => {
      subject.percentage = subject.totalHours > 0
        ? Math.round((subject.completedHours / subject.totalHours) * 100)
        : 0;
    });

    data.subjectProgress = Array.from(subjectMap.values());

    // Calculate streak (simplified)
    data.streakDays = calculateStreak(data.weeklyProgress);

    setProgressData(data);
    if (onProgressUpdate) {
      onProgressUpdate(data);
    }
  };

  // Check if activity is completed (mock implementation)
  const checkIfActivityCompleted = (day: string, time: string): boolean => {
    const key = `${day}_${time}`;
    const saved = localStorage.getItem(`activity_complete_${key}`);
    return saved === 'true';
  };

  // Calculate streak
  const calculateStreak = (weeklyProgress: WeekProgress[]): number => {
    let streak = 0;
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Monday=0 index

    for (let i = todayIndex; i >= 0; i--) {
      if (weeklyProgress[i]?.percentage > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Toggle activity completion
  const toggleActivityCompletion = (day: string, time: string) => {
    const key = `${day}_${time}`;
    const currentStatus = localStorage.getItem(`activity_complete_${key}`) === 'true';
    localStorage.setItem(`activity_complete_${key}`, (!currentStatus).toString());
    calculateInitialProgress(); // Recalculate progress
  };

  // Toggle subject expansion
  const toggleSubjectExpansion = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  // Get progress color
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get progress background
  const getProgressBackground = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!progressData) {
    return (
      <div className="progress-tracker-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const overallPercentage = progressData.totalActivities > 0
    ? Math.round((progressData.completedActivities / progressData.totalActivities) * 100)
    : 0;

  const studyPercentage = progressData.totalStudyHours > 0
    ? Math.round((progressData.completedStudyHours / progressData.totalStudyHours) * 100)
    : 0;

  return (
    <div className="progress-tracker">
      {/* Header */}
      <div className="progress-header">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Progress Tracker</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="streak-badge">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">{progressData.streakDays} day streak</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Cards */}
      <div className="progress-cards">
        <div className="progress-card">
          <div className="card-icon">
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Overall Progress</h3>
            <div className="progress-stat">
              <span className="stat-value">{overallPercentage}%</span>
              <span className="stat-label">
                {progressData.completedActivities}/{progressData.totalActivities} activities
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getProgressBackground(overallPercentage)}`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="progress-card">
          <div className="card-icon">
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Study Progress</h3>
            <div className="progress-stat">
              <span className="stat-value">{studyPercentage}%</span>
              <span className="stat-label">
                {progressData.completedStudyHours}/{progressData.totalStudyHours} hours
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${getProgressBackground(studyPercentage)}`}
                style={{ width: `${studyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="progress-card">
          <div className="card-icon">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <div className="card-content">
            <h3 className="card-title">This Week</h3>
            <div className="week-summary">
              {progressData.weeklyProgress.map((day, index) => (
                <div key={day.day} className="day-progress">
                  <div className="day-label">{day.day.slice(0, 3)}</div>
                  <div className="day-bar">
                    <div
                      className={`day-fill ${getProgressBackground(day.percentage)}`}
                      style={{ height: `${day.percentage}%` }}
                    />
                  </div>
                  <div className="day-percentage">{day.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress */}
      <div className="subject-progress-section">
        <h3 className="section-title">Subject Progress</h3>
        <div className="subject-list">
          {progressData.subjectProgress.map(subject => (
            <div key={subject.subject} className="subject-card">
              <div
                className="subject-header"
                onClick={() => toggleSubjectExpansion(subject.subject)}
              >
                <div className="subject-info">
                  <h4 className="subject-name">{subject.subject}</h4>
                  <p className="subject-hours">
                    {subject.completedHours}/{subject.totalHours} hours completed
                  </p>
                </div>
                <div className="subject-metrics">
                  <span className={`subject-percentage ${getProgressColor(subject.percentage)}`}>
                    {subject.percentage}%
                  </span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${expandedSubjects.has(subject.subject) ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {expandedSubjects.has(subject.subject) && (
                <div className="subject-details">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressBackground(subject.percentage)}`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                  <div className="activity-list">
                    {subject.activities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <button
                          onClick={() => toggleActivityCompletion(
                            activity.time.split('-')[0].toLowerCase(), // Simplified day extraction
                            activity.time
                          )}
                          className={`activity-checkbox ${activity.completed ? 'completed' : ''}`}
                        >
                          {activity.completed && <CheckCircle className="w-4 h-4" />}
                        </button>
                        <span className={`activity-name ${activity.completed ? 'completed' : ''}`}>
                          {activity.activity}
                        </span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="motivation-section">
        <div className="motivation-card">
          <h3 className="motivation-title">Keep Going!</h3>
          <p className="motivation-message">
            {overallPercentage >= 80
              ? "Excellent work! You're on track to achieve your goals."
              : overallPercentage >= 60
              ? "Good progress! Keep maintaining your study schedule."
              : overallPercentage >= 40
              ? "You're making progress. Try to stay consistent."
              : "Let's get back on track! Complete your scheduled activities."
            }
          </p>
        </div>
      </div>
    </div>
  );
}