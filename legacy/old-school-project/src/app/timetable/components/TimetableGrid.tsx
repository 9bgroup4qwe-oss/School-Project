'use client';

import { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, BookOpen, Coffee, Dumbbell, Music } from 'lucide-react';

interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'study' | 'break' | 'activity' | 'meal' | 'sleep' | 'free';
  title: string;
  color: string;
  location?: string;
}

interface TimetableGridProps {
  timetable: TimetableSlot[];
  isEditing: boolean;
  onTimetableChange: (timetable: TimetableSlot[]) => void;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // Start from 6 AM
  return `${hour.toString().padStart(2, '0')}:00`;
});

const activityTypes = {
  class: { icon: BookOpen, color: '#537fe7', label: 'Class' },
  study: { icon: BookOpen, color: '#ffe537', label: 'Study' },
  break: { icon: Coffee, color: '#22c55e', label: 'Break' },
  activity: { icon: Music, color: '#f59e0b', label: 'Activity' },
  meal: { icon: Coffee, color: '#ef4444', label: 'Meal' },
  sleep: { icon: Clock, color: '#8b5cf6', label: 'Sleep' },
  free: { icon: Clock, color: 'transparent', label: 'Free' }
};

export function TimetableGrid({ timetable, isEditing, onTimetableChange }: TimetableGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  const getSlotForTime = (day: string, time: string): TimetableSlot | undefined => {
    return timetable.find(slot => {
      const slotStart = parseInt(slot.startTime.split(':')[0]);
      const slotEnd = parseInt(slot.endTime.split(':')[0]);
      const currentTime = parseInt(time.split(':')[0]);
      return slot.day === day && currentTime >= slotStart && currentTime < slotEnd;
    });
  };

  const handleSlotClick = (day: string, time: string) => {
    if (isEditing) {
      const existingSlot = getSlotForTime(day, time);
      if (existingSlot) {
        setSelectedSlot(existingSlot);
      } else {
        // Create new slot
        const newSlot: TimetableSlot = {
          id: Date.now().toString(),
          day,
          startTime: time,
          endTime: `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
          type: 'study',
          title: 'New Activity',
          color: activityTypes.study.color
        };
        onTimetableChange([...timetable, newSlot]);
      }
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    onTimetableChange(timetable.filter(s => s.id !== slotId));
    setSelectedSlot(null);
  };

  const handleUpdateSlot = (slotId: string, updates: Partial<TimetableSlot>) => {
    onTimetableChange(
      timetable.map(s => s.id === slotId ? { ...s, ...updates } : s)
    );
    setSelectedSlot(null);
  };

  return (
    <div className="timetable-grid">
      <div className="timetable-header">
        <h3 className="timetable-grid-title">Your Weekly Schedule</h3>
        {isEditing && (
          <p className="edit-hint">Click on any time slot to add or edit an activity</p>
        )}
      </div>

      <div className="timetable-wrapper">
        {/* Time Labels */}
        <div className="time-labels">
          <div className="corner-cell"></div>
          {timeSlots.map(time => (
            <div key={time} className="time-label">
              {time}
            </div>
          ))}
        </div>

        {/* Days and Slots */}
        <div className="timetable-content">
          {days.map(day => (
            <div key={day} className="day-column">
              <div className="day-header">{day.slice(0, 3)}</div>
              {timeSlots.map(time => {
                const slot = getSlotForTime(day, time);
                const isFirstHour = slot && slot.startTime === time;

                return (
                  <div
                    key={time}
                    className={`time-slot ${slot ? 'occupied' : 'empty'} ${isEditing ? 'editable' : ''}`}
                    onClick={() => handleSlotClick(day, time)}
                  >
                    {isFirstHour && slot && (
                      <div
                        className="slot-content"
                        style={{ backgroundColor: `${slot.color}20`, borderLeftColor: slot.color }}
                      >
                        <div className="slot-header">
                          <span className="slot-title">{slot.title}</span>
                          {isEditing && (
                            <div className="slot-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSlot(slot);
                                }}
                                className="slot-action-button"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot.id);
                                }}
                                className="slot-action-button delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="slot-details">
                          <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                          {slot.location && (
                            <span className="slot-location">{slot.location}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="timetable-legend">
        <h4>Activity Types</h4>
        <div className="legend-items">
          {Object.entries(activityTypes).filter(([type]) => type !== 'free').map(([type, config]) => (
            <div key={type} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: config.color }}></div>
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedSlot && isEditing && (
        <div className="edit-modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Activity</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedSlot.title}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={selectedSlot.type}
                  onChange={(e) => setSelectedSlot({
                    ...selectedSlot,
                    type: e.target.value as TimetableSlot['type'],
                    color: activityTypes[e.target.value as keyof typeof activityTypes].color
                  })}
                  className="form-select"
                >
                  {Object.entries(activityTypes).filter(([type]) => type !== 'free').map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={selectedSlot.startTime}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, startTime: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={selectedSlot.endTime}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, endTime: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location (optional)</label>
                <input
                  type="text"
                  value={selectedSlot.location || ''}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, location: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setSelectedSlot(null)}
                className="modal-button secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSlot(selectedSlot.id, selectedSlot)}
                className="modal-button primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}