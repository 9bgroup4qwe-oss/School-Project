'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TimetableData } from '@/types/timetable';

interface TimetableCalendarViewProps {
  timetable: TimetableData;
}

export function TimetableCalendarView({ timetable }: TimetableCalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div style={{ padding: '2rem', background: 'rgb(26 26 46)', borderRadius: '12px', minHeight: '600px' }}>
      <h2 style={{ color: 'rgb(226 226 245)', marginBottom: '1rem' }}>Calendar View</h2>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        style={{
          background: 'white',
          color: 'black',
          padding: '1rem'
        }}
      />
      <p style={{ marginTop: '1rem', color: 'rgb(226 226 245)' }}>
        Selected: {date?.toLocaleDateString()}
      </p>
    </div>
  );
}