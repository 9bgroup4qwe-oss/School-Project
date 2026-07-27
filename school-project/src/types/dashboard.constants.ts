import { DashboardData } from './dashboard';
import { getCourseColor } from '@/lib/theme';

export const DASHBOARD_DATA: DashboardData = {
  courses: [
    {
      id: '1',
      title: 'Web Development',
      taskCount: 10,
      completionPercentage: 96,
      nextTask: 'Project Deployment',
      color: getCourseColor(0)
    },
    {
      id: '2',
      title: 'Mobile App Design',
      taskCount: 12,
      completionPercentage: 46,
      nextTask: 'Prototyping',
      color: getCourseColor(1)
    },
    {
      id: '3',
      title: 'Data Structures (Python)',
      taskCount: 22,
      completionPercentage: 71,
      nextTask: 'Binary Trees',
      color: getCourseColor(2)
    }
  ],
  todayTasks: [
    {
      id: '1',
      title: 'Prepare Figma file',
      course: 'Mobile App Course',
      duration: '1hr',
      color: 'var(--color-chart-1)'
    },
    {
      id: '2',
      title: 'Design UX wireframes',
      course: 'UX/UI Fundamentals',
      duration: '2.5hrs',
      color: 'var(--color-chart-2)'
    },
    {
      id: '3',
      title: 'Review Python Loops',
      course: 'Data Structures',
      duration: '45min',
      color: 'var(--color-chart-3)'
    }
  ],
  calendarEvents: [
    {
      id: '1',
      date: 'Oct 26, 2025',
      time: '10:00',
      title: 'Live Class: React Hooks',
      subtitle: 'Web Development Course',
      type: 'class'
    },
    {
      id: '2',
      date: 'Oct 26, 2025',
      time: '13:20',
      title: 'Assignment: Database Design',
      subtitle: 'Due Today',
      type: 'assignment'
    },
    {
      id: '3',
      date: 'Oct 27, 2025',
      time: '10:00',
      title: 'Study Session: Algorithms',
      subtitle: 'Personal Focus Time',
      type: 'session'
    },
    {
      id: '4',
      date: 'Oct 27, 2025',
      time: '11:00',
      title: 'Mentor 1-on-1 Meetup',
      subtitle: 'Networking Group',
      type: 'meeting'
    }
  ],
  statistics: {
    trackedTime: '28h',
    finishedTasks: 18,
    planPrice: '$9.99 /m'
  }
};