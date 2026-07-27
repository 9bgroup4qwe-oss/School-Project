'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, BookOpen, Coffee, Dumbbell, Music, MessageCircle, Edit3 } from 'lucide-react';
import { TimetableData, TimetableSlot, DAYS_OF_WEEK, DAYS_OF_WEEK_LOWER } from '@/types/timetable';
import { ACTIVITY_TYPES } from '@/types/timetable';
import { TimeGrid } from './TimeGrid';
import { ActivitySlot } from './ActivitySlot';

interface OptimizedVisualTimetableProps {
  timetable: TimetableData;
  onEdit?: () => void;
  onInteractiveEdit?: () => void;
}

// Set icons for activity types
const activityTypesWithIcons = {
  ...ACTIVITY_TYPES,
  class: { ...ACTIVITY_TYPES.class, icon: BookOpen },
  study: { ...ACTIVITY_TYPES.study, icon: BookOpen },
  break: { ...ACTIVITY_TYPES.break, icon: Coffee },
  activity: { ...ACTIVITY_TYPES.activity, icon: Music },
  meal: { ...ACTIVITY_TYPES.meal, icon: Coffee },
  personal: { ...ACTIVITY_TYPES.personal, icon: Clock }
};

export function OptimizedVisualTimetable({ timetable, onEdit, onInteractiveEdit }: OptimizedVisualTimetableProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Memoize time slots
  const timeSlots = useMemo(() =>
    Array.from({ length: 17 }, (_, i) => {
      const hour = i + 6; // Start from 6 AM
      return `${hour.toString().padStart(2, '0')}:00`;
    }), []
  );

  // Memoize current time position
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return ((hours - 6) * 60 + minutes) / 60; // Position in hours from 6 AM
  }, [currentTime]);

  // Memoize if current time is in range
  const isCurrentTimeInRange = useMemo(() => {
    const hours = currentTime.getHours();
    const day = currentTime.getDay();
    const isWeekday = day >= 1 && day <= 5;
    return isWeekday && hours >= 6 && hours <= 22;
  }, [currentTime]);

  // Memoize get slot for time function
  const getSlotForTime = useMemo(() => {
    return (day: string, time: string): TimetableSlot | undefined => {
      if (!timetable?.schedule) return undefined;

      const daySchedule = timetable.schedule[day.toLowerCase()];
      if (!daySchedule) return undefined;

      return daySchedule.find(slot => {
        const [slotStart] = slot.time.split('-');
        const [nextHour] = time.split(':');
        const slotHour = parseInt(slotStart.split(':')[0]);

        // Check if the time falls within the slot duration
        const slotEnd = slot.time.split('-')[1];
        const slotEndHour = parseInt(slotEnd.split(':')[0]);
        const currentHour = parseInt(nextHour);

        return currentHour >= slotHour && currentHour < slotEndHour;
      });
    };
  }, [timetable?.schedule]);

  // Memoize get slot position function
  const getSlotPosition = useMemo(() => {
    return (slot: TimetableSlot): number => {
      const [start] = slot.time.split('-');
      const [hour] = start.split(':').map(Number);
      return hour - 6; // Offset from 6 AM
    };
  }, []);

  // Memoize activity types used in timetable
  const usedActivityTypes = useMemo(() => {
    if (!timetable?.schedule) return [];

    const usedTypes = new Set<string>();
    Object.values(timetable.schedule).forEach(day => {
      day.forEach(slot => {
        if (activityTypesWithIcons[slot.type]) {
          usedTypes.add(slot.type);
        }
      });
    });

    return Array.from(usedTypes);
  }, [timetable?.schedule]);

  return (
    <div className="visual-timetable">
      {/* Header */}
      <div className="timetable-header">
        <h2 className="timetable-title">Your Weekly Schedule</h2>
        <div className="header-actions">
          <button onClick={onInteractiveEdit} className="edit-button interactive">
            <Edit3 className="w-4 h-4 mr-2" />
            Interactive Edit
          </button>
          <button onClick={onEdit} className="edit-button">
            <MessageCircle className="w-4 h-4 mr-2" />
            Edit with AI
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <TimeGrid>
        <div className="days-columns">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <div key={day} className="day-column">
              <div className="day-header">{day}</div>
              <div className="day-slots">
                {timeSlots.map(time => {
                  const slot = getSlotForTime(day, time);
                  const isFirstHour = slot && getSlotPosition(slot) === parseInt(time.split(':')[0]) - 6;

                  return (
                    <div key={time} className="hour-slot">
                      {isFirstHour && slot && (
                        <ActivitySlot
                          key={`${day}-${slot.time}`}
                          slot={slot}
                          activityConfig={activityTypesWithIcons[slot.type]}
                          isHovered={hoveredSlot === `${day}-${slot.time}`}
                          onHover={(hovered) =>
                            setHoveredSlot(hovered ? `${day}-${slot.time}` : null)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </TimeGrid>

      {/* Current Time Indicator */}
      {isCurrentTimeInRange && (
        <div
          className="current-time-line"
          style={{
            top: `${currentTimePosition * 60 + 40}px` // 40px for header
          }}
        >
          <div className="time-dot"></div>
          <span className="time-label">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="timetable-legend">
        <h3>Activity Types</h3>
        <div className="legend-items">
          {usedActivityTypes.map(type => {
            const config = activityTypesWithIcons[type as keyof typeof activityTypesWithIcons];
            if (!config) return null;

            return (
              <div key={type} className="legend-item">
                <div
                  className="legend-color"
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    borderWidth: '2px',
                    borderStyle: 'solid'
                  }}
                ></div>
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}