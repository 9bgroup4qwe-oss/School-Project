'use client';

import React from 'react';
import { Clock, MapPin, BookOpen, Coffee, Dumbbell, Music, User, Calendar } from 'lucide-react';
import { TimetableData, TimetableSlot } from '@/types/timetable';

interface TimetableListViewProps {
  timetable: TimetableData;
}

const ACTIVITY_ICONS = {
  class: BookOpen,
  study: BookOpen,
  meal: Coffee,
  break: Clock,
  activity: Dumbbell,
  personal: User
};

const ACTIVITY_COLORS = {
  class: 'text-blue-600 bg-blue-50',
  study: 'text-green-600 bg-green-50',
  meal: 'text-yellow-600 bg-yellow-50',
  break: 'text-purple-600 bg-purple-50',
  activity: 'text-pink-600 bg-pink-50',
  personal: 'text-gray-600 bg-gray-50'
};

export function TimetableListView({ timetable }: TimetableListViewProps) {
  // Group activities by day and sort by time
  const groupedActivities = React.useMemo(() => {
    const groups: { [key: string]: TimetableSlot[] } = {};

    Object.entries(timetable.schedule).forEach(([day, slots]) => {
      if (slots.length > 0) {
        // Sort slots by time
        const sortedSlots = [...slots].sort((a, b) => {
          const timeA = parseInt(a.time.split('-')[0].split(':')[0]);
          const timeB = parseInt(b.time.split('-')[0].split(':')[0]);
          return timeA - timeB;
        });
        groups[day] = sortedSlots;
      }
    });

    return groups;
  }, [timetable]);

  const formatTimeRange = (timeRange: string) => {
    const [start, end] = timeRange.split('-');
    return `${start} - ${end}`;
  };

  const getActivityDuration = (timeRange: string) => {
    const [start, end] = timeRange.split('-');
    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);
    return `${endHour - startHour}h`;
  };

  return (
    <div className="timetable-list-view">
      <div className="list-header">
        <h3 className="list-title">
          <Calendar className="w-5 h-5 mr-2" />
          Weekly Schedule Overview
        </h3>
        <p className="list-subtitle">
          All your activities organized by day and time
        </p>
      </div>

      <div className="list-content">
        {Object.entries(groupedActivities).map(([day, activities]) => {
          const dayDate = new Date();
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayIndex = dayNames.indexOf(day.charAt(0).toUpperCase() + day.slice(1));
          const isToday = new Date().getDay() === dayIndex;

          return (
            <div key={day} className={`day-section ${isToday ? 'today' : ''}`}>
              <div className="day-header">
                <h4 className="day-name">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                  {isToday && <span className="today-badge">Today</span>}
                </h4>
                <span className="activity-count">{activities.length} activities</span>
              </div>

              <div className="activities-list">
                {activities.map((activity, index) => {
                  const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Clock;
                  const colorClass = ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS] || ACTIVITY_COLORS.personal;

                  return (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="activity-details">
                        <div className="activity-main">
                          <h5 className="activity-name">{activity.activity}</h5>
                          <div className="activity-meta">
                            <span className="activity-time">
                              <Clock className="w-3 h-3" />
                              {formatTimeRange(activity.time)}
                            </span>
                            <span className="activity-duration">
                              {getActivityDuration(activity.time)}
                            </span>
                            {activity.location && (
                              <span className="activity-location">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="activity-type">
                          <span className={`type-badge ${colorClass}`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>

                      {/* Progress indicator for study activities */}
                      {activity.type === 'study' && (
                        <div className="activity-progress">
                          <div className="progress-ring">
                            <svg className="progress-svg" width="40" height="40">
                              <circle
                                className="progress-bg"
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="3"
                              />
                              <circle
                                className="progress-fill"
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.random() * 100} 100`}
                                transform="rotate(-90 20 20)"
                              />
                            </svg>
                            <span className="progress-text">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(groupedActivities).length === 0 && (
          <div className="empty-state">
            <Calendar className="w-12 h-12 text-gray-400" />
            <h4>No activities found</h4>
            <p>Try adjusting your filters to see more activities.</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="list-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Days</span>
            <span className="summary-value">{Object.keys(groupedActivities).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Activities</span>
            <span className="summary-value">
              {Object.values(groupedActivities).reduce((sum, activities) => sum + activities.length, 0)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Study Hours</span>
            <span className="summary-value">
              {Object.values(groupedActivities).flat().reduce((sum, activity) => {
                if (activity.type === 'study') {
                  const [start, end] = activity.time.split('-');
                  const [startHour] = start.split(':').map(Number);
                  const [endHour] = end.split(':').map(Number);
                  return sum + (endHour - startHour);
                }
                return sum;
              }, 0)}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}