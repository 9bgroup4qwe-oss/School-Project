'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export function SimpleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div style={{ padding: '2rem', background: 'white', borderRadius: '8px' }}>
      <h2>Simple Calendar Test</h2>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        style={{ background: 'white', color: 'black' }}
      />
      <p style={{ marginTop: '1rem' }}>
        Selected: {date?.toLocaleDateString()}
      </p>
    </div>
  );
}