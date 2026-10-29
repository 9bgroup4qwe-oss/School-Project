// Unified types for timetable feature

export type ActivityType = 'class' | 'study' | 'meal' | 'break' | 'activity' | 'personal';

export type Priority = 'high' | 'medium' | 'low';

export interface TimetableSlot {
  time: string;
  activity: string;
  type: ActivityType;
  location?: string;
  priority?: Priority;
}

export interface DaySchedule {
  [dayName: string]: TimetableSlot[];
}

export interface TimetableMetadata {
  title?: string;
  description?: string;
  semester?: string;
  year?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimetableSettings {
  notifications?: boolean;
  studyReminders?: boolean;
  colorScheme?: 'light' | 'dark';
  autoSave?: boolean;
}

export interface TimetableData {
  id?: string;
  metadata: TimetableMetadata;
  schedule: DaySchedule;
  settings: TimetableSettings;
  is_active?: boolean;
  saved_to?: 'localStorage' | 'supabase';
  backend_error?: any;
  fallback_reason?: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  showChat: boolean;
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
}

export interface TimetableState {
  timetable: TimetableData | null;
  timetableId: string | null;
  isSaving: boolean;
  showSuccess: boolean;
  copied: boolean;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
  hint?: string;
  needsMigration?: boolean;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
}

// Activity type configuration
export interface ActivityConfig {
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor?: string;
  label: string;
}

// Form types
export interface TimetableFormData {
  // Basic info
  title: string;
  description: string;
  semester: string;
  year: string;

  // Classes
  classes: ClassInfo[];

  // Study preferences
  studyHours: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  studyDays: string[];
  breakDuration: number;

  // Activities
  activities: ActivityInfo[];
}

export interface ClassInfo {
  name: string;
  type: string;
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
  priority: Priority;
}

export interface ActivityInfo {
  name: string;
  type: ActivityType;
  days: string[];
  startTime: string;
  endTime: string;
  location?: string;
  priority: Priority;
}

// Export type guards
export function isValidTimetableSlot(obj: any): obj is TimetableSlot {
  return obj &&
    typeof obj.time === 'string' &&
    typeof obj.activity === 'string' &&
    ['class', 'study', 'meal', 'break', 'activity', 'personal'].includes(obj.type);
}

export function isValidTimetableData(obj: any): obj is TimetableData {
  return obj &&
    typeof obj === 'object' &&
    obj.schedule &&
    typeof obj.schedule === 'object' &&
    obj.metadata &&
    typeof obj.metadata === 'object';
}

// Constants
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const DAYS_OF_WEEK_LOWER = DAYS_OF_WEEK.map(day => day.toLowerCase());

export const ACTIVITY_TYPES: Record<ActivityType, ActivityConfig> = {
  class: {
    icon: null, // Will be set by component
    color: '#537fe7',
    bgColor: 'rgba(83, 127, 231, 0.1)',
    borderColor: '#537fe7',
    label: 'Class'
  },
  study: {
    icon: null,
    color: '#ffe537',
    bgColor: 'rgba(255, 229, 55, 0.1)',
    borderColor: '#ffe537',
    textColor: '#f9f9f9',
    label: 'Study'
  },
  break: {
    icon: null,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
    label: 'Break'
  },
  activity: {
    icon: null,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    label: 'Activity'
  },
  meal: {
    icon: null,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    label: 'Meal'
  },
  personal: {
    icon: null,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
    label: 'Personal'
  }
};