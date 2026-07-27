export interface Course {
  id: string;
  title: string;
  taskCount: number;
  completionPercentage: number;
  nextTask: string;
  color: string;
}

export interface TodayTask {
  id: string;
  title: string;
  course: string;
  duration: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  subtitle: string;
  type: 'class' | 'assignment' | 'session' | 'meeting';
}

export interface Statistics {
  trackedTime: string;
  finishedTasks: number;
  planPrice: string;
}

export interface DashboardData {
  courses: Course[];
  todayTasks: TodayTask[];
  calendarEvents: CalendarEvent[];
  statistics: Statistics;
}