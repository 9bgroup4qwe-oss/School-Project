'use client';

import { useMemo } from 'react';
import { TimetableSlot, ActivityConfig } from '@/types/timetable';
import { ACTIVITY_TYPES } from '@/types/timetable';

interface ActivitySlotProps {
  slot: TimetableSlot;
  activityConfig: ActivityConfig;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

export function ActivitySlot({ slot, activityConfig, isHovered, onHover }: ActivitySlotProps) {
  const slotHeight = useMemo(() => {
    const [start, end] = slot.time.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return duration / 60; // Return height in hours
  }, [slot.time]);

  return (
    <div
      className={`activity-slot ${slot.type}`}
      style={{
        backgroundColor: activityConfig.bgColor,
        borderColor: activityConfig.borderColor,
        height: `${slotHeight * 60}px`,
        color: activityConfig.textColor || '#fff'
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
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
      {isHovered && (
        <div className="activity-tooltip">
          <p className="tooltip-title">{slot.activity}</p>
          <p className="tooltip-type">{activityConfig.label}</p>
          <p className="tooltip-time">{slot.time}</p>
          {slot.location && <p className="tooltip-location">{slot.location}</p>}
        </div>
      )}
    </div>
  );
}