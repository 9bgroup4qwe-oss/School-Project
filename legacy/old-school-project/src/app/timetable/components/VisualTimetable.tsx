'use client';

import { useState, useEffect } from 'react';
import { Clock, BookOpen, Coffee, Dumbbell, Music, Edit3, MessageCircle } from 'lucide-react';

interface TimetableSlot {
  time: string;
  activity: string;
  type: 'class' | 'study' | 'meal' | 'break' | 'activity' | 'personal';
  location?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DaySchedule {
  [key: string]: TimetableSlot[];
}

interface VisualTimetableProps {
  timetable: {
    schedule: DaySchedule;
    metadata?: any;
    settings?: any;
  };
  onEdit?: () => void;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // Start from 6 AM
  return `${hour.toString().padStart(2, '0')}:00`;
});

const activityTypes = {
  class: {
    icon: BookOpen,
    color: '#537fe7',
    bgColor: 'rgba(83, 127, 231, 0.1)',
    borderColor: '#537fe7',
    label: 'Class'
  },
  study: {
    icon: BookOpen,
    color: '#ffe537',
    bgColor: 'rgba(255, 229, 55, 0.1)',
    borderColor: '#ffe537',
    textColor: '#f9f9f9',
    label: 'Study'
  },
  break: {
    icon: Coffee,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
    label: 'Break'
  },
  activity: {
    icon: Music,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    label: 'Activity'
  },
  meal: {
    icon: Coffee,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    label: 'Meal'
  },
  personal: {
    icon: Clock,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
    label: 'Personal'
  }
};

export function VisualTimetable({ timetable, onEdit }: VisualTimetableProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Debug logging
  console.log('VisualTimetable rendered with:', timetable);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get current time position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const position = ((hours - 6) * 60 + minutes) / 60; // Position in hours from 6 AM
    return position;
  };

  // Check if current time is within timetable range
  const isCurrentTimeInRange = () => {
    const hours = currentTime.getHours();
    const day = currentTime.getDay();
    const isWeekday = day >= 1 && day <= 5;
    return isWeekday && hours >= 6 && hours <= 22;
  };

  // Get slot for specific time and day
  const getSlotForTime = (day: string, time: string): TimetableSlot | undefined => {
    if (!timetable || !timetable.schedule) {
      console.log('No timetable or schedule found');
      return undefined;
    }

    const daySchedule = timetable.schedule[day.toLowerCase()];
    if (!daySchedule) {
      console.log(`No schedule for ${day.toLowerCase()}`);
      return undefined;
    }

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

  // Calculate slot height based on duration
  const getSlotHeight = (slot: TimetableSlot): number => {
    const [start, end] = slot.time.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return duration / 60; // Return height in hours
  };

  // Get slot position (top offset)
  const getSlotPosition = (slot: TimetableSlot): number => {
    const [start] = slot.time.split('-');
    const [hour] = start.split(':').map(Number);
    return hour - 6; // Offset from 6 AM
  };

  return (
    <div className="visual-timetable">
      {/* Header */}
      <div className="timetable-header">
        <h2 className="timetable-title">Your Weekly Schedule</h2>
        <button onClick={onEdit} className="edit-button">
          <MessageCircle className="w-4 h-4 mr-2" />
          Edit with AI
        </button>
      </div>

      {/* Timetable Grid */}
      <div className="timetable-grid-container">
        {/* Time Labels */}
        <div className="time-column">
          <div className="time-header"></div>
          {timeSlots.map(time => (
            <div key={time} className="time-slot-label">
              {time}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="days-columns">
          {days.map((day, dayIndex) => (
            <div key={day} className="day-column">
              <div className="day-header">{day}</div>
              <div className="day-slots">
                {timeSlots.map(time => {
                  const slot = getSlotForTime(day, time);
                  const isFirstHour = slot && getSlotPosition(slot) === parseInt(time.split(':')[0]) - 6;

                  return (
                    <div key={time} className="hour-slot">
                      {isFirstHour && slot && (
                        <div
                          className={`activity-slot ${slot.type}`}
                          style={{
                            backgroundColor: activityTypes[slot.type]?.bgColor,
                            borderColor: activityTypes[slot.type]?.borderColor,
                            height: `${getSlotHeight(slot) * 60}px`,
                            color: activityTypes[slot.type]?.textColor || '#fff'
                          }}
                          onMouseEnter={() => setHoveredSlot(`${day}-${slot.time}`)}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          <div className="activity-content">
                            <div className="activity-header">
                              <span className="activity-title">{slot.activity}</span>
                              {slot.priority === 'high' && (
                                <span className="priority-indicator">⭐</span>
                              )}
                            </div>
                            <div className="activity-details">
                              <span className="activity-time">{slot.time}</span>
                              {slot.location && (
                                <span className="activity-location">📍 {slot.location}</span>
                              )}
                            </div>
                          </div>

                          {/* Hover Details */}
                          {hoveredSlot === `${day}-${slot.time}` && (
                            <div className="activity-tooltip">
                              <p className="tooltip-title">{slot.activity}</p>
                              <p className="tooltip-type">{activityTypes[slot.type]?.label}</p>
                              <p className="tooltip-time">{slot.time}</p>
                              {slot.location && <p className="tooltip-location">{slot.location}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Time Indicator */}
      {isCurrentTimeInRange() && (
        <div
          className="current-time-line"
          style={{
            top: `${getCurrentTimePosition() * 60 + 40}px` // 40px for header
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
          {Object.entries(activityTypes).filter(([type]) =>
            timetable.schedule && Object.values(timetable.schedule).some(day =>
              day.some(slot => slot.type === type)
            )
          ).map(([type, config]) => (
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
          ))}
        </div>
      </div>

      {/* Selected Slot Details */}
      {selectedSlot && (
        <div className="selected-slot-details">
          <h3>{selectedSlot.activity}</h3>
          <p>Type: {activityTypes[selectedSlot.type]?.label}</p>
          <p>Time: {selectedSlot.time}</p>
          {selectedSlot.location && <p>Location: {selectedSlot.location}</p>}
        </div>
      )}
    </div>
  );
}