export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'study' | 'break' | 'activity' | 'meal' | 'sleep' | 'free';
  title: string;
  color: string;
  location?: string;
}

export const generateEmptyTimetable = (): TimetableSlot[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots: TimetableSlot[] = [];

  // Add sleep blocks
  days.forEach(day => {
    if (day !== 'Saturday' && day !== 'Sunday') {
      // Weekday sleep
      slots.push({
        id: `${day}-sleep-1`,
        day,
        startTime: '22:00',
        endTime: '23:00',
        type: 'sleep',
        title: 'Sleep',
        color: '#8b5cf6'
      });
    }
  });

  return slots;
};

export const validateTimeSlot = (slot: Partial<TimetableSlot>): string[] => {
  const errors: string[] = [];

  if (!slot.day) errors.push('Day is required');
  if (!slot.startTime) errors.push('Start time is required');
  if (!slot.endTime) errors.push('End time is required');
  if (!slot.title) errors.push('Title is required');

  if (slot.startTime && slot.endTime) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);

    if (start >= end) {
      errors.push('End time must be after start time');
    }

    if (start < 360 || end > 1380) { // 6:00 AM to 11:00 PM
      errors.push('Time must be between 6:00 AM and 11:00 PM');
    }
  }

  return errors;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const checkConflicts = (slots: TimetableSlot[], newSlot: Partial<TimetableSlot>): boolean => {
  if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) return false;

  const newStart = timeToMinutes(newSlot.startTime);
  const newEnd = timeToMinutes(newSlot.endTime);

  return slots.some(slot => {
    if (slot.day !== newSlot.day) return false;

    const existingStart = timeToMinutes(slot.startTime);
    const existingEnd = timeToMinutes(slot.endTime);

    return (
      (newStart < existingEnd && newEnd > existingStart) ||
      (newStart === existingStart && newEnd === existingEnd)
    );
  });
};

export const optimizeStudyTime = (slots: TimetableSlot[], subject: string, difficulty: 'easy' | 'medium' | 'hard'): string => {
  // Find optimal time based on user's energy levels
  const morningSlots = slots.filter(s => s.day !== 'Saturday' && s.day !== 'Sunday')
    .filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 6 && hour < 12;
    });

  const afternoonSlots = slots.filter(s => s.day !== 'Saturday' && s.day !== 'Sunday')
    .filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 12 && hour < 17;
    });

  const eveningSlots = slots.filter(s => s.day !== 'Saturday' && s.day !== 'Sunday')
    .filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return hour >= 17 && hour < 22;
    });

  // Hard subjects are better in the morning when alert
  if (difficulty === 'hard' && morningSlots.length > 0) {
    return 'morning';
  }

  // Medium subjects work well in afternoon
  if (difficulty === 'medium' && afternoonSlots.length > 0) {
    return 'afternoon';
  }

  // Easy subjects can be in evening
  if (difficulty === 'easy' && eveningSlots.length > 0) {
    return 'evening';
  }

  return 'flexible';
};

export const exportToJSON = (slots: TimetableSlot[]): string => {
  const grouped: Record<string, TimetableSlot[]> = {};

  slots.forEach(slot => {
    if (!grouped[slot.day]) {
      grouped[slot.day] = [];
    }
    grouped[slot.day].push(slot);
  });

  // Sort each day by time
  Object.keys(grouped).forEach(day => {
    grouped[day].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  });

  return JSON.stringify(grouped, null, 2);
};

export const exportToCSV = (slots: TimetableSlot[]): string => {
  const headers = ['Day', 'Start Time', 'End Time', 'Activity', 'Type', 'Location'];
  const rows = slots.map(slot => [
    slot.day,
    slot.startTime,
    slot.endTime,
    slot.title,
    slot.type,
    slot.location || ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};