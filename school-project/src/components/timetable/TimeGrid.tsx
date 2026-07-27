'use client';

import { useMemo } from 'react';

interface TimeGridProps {
  children: React.ReactNode;
}

export function TimeGrid({ children }: TimeGridProps) {
  const timeSlots = useMemo(() =>
    Array.from({ length: 17 }, (_, i) => {
      const hour = i + 6; // Start from 6 AM
      return `${hour.toString().padStart(2, '0')}:00`;
    }), []
  );

  return (
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
      {children}
    </div>
  );
}