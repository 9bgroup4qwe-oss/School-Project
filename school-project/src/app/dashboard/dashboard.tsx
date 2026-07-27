'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { QuizStatistics } from '@/components/dashboard/QuizStatistics';
import { DASHBOARD_DATA } from '@/types/dashboard.constants';
import type { Course, TodayTask, CalendarEvent } from '@/types/dashboard';

const CourseCard = ({ course }: { course: Course }) => (
  <div className="course-card fade-in-up stagger-1">
    <h3 className="course-card-title">{course.title}</h3>
    <p className="card-subtitle">
      {course.taskCount} tasks | {course.completionPercentage}% Complete
    </p>
    <div className="progress-bar mb-3">
      <div
        className="progress-fill"
        style={{ width: `${course.completionPercentage}%` }}
      ></div>
    </div>
    <p className="course-card-next-task">Next: {course.nextTask}</p>
  </div>
);

const TaskCard = ({ task }: { task: TodayTask }) => (
  <div className="task-card fade-in-up stagger-2">
    <h4 className="task-card-title">{task.title}</h4>
    <p className="task-card-subtitle">{task.course}</p>
    <span className="task-card-duration">{task.duration}</span>
  </div>
);

const CalendarEventItem = ({ event }: { event: CalendarEvent }) => (
  <div className="calendar-event fade-in-up stagger-5">
    <div className="calendar-time">
      <span className="calendar-time-day">{event.date.split(',')[0]}</span>
      <span className="calendar-time-hour">{event.time}</span>
    </div>
    <div className="flex-1">
      <h4 className="calendar-content-title">{event.title}</h4>
      <p className="calendar-content-subtitle">{event.subtitle}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`stat-card fade-in-up ${highlight ? 'stat-card-highlight' : ''} ${highlight ? 'stagger-3' : 'stagger-4'}`}>
    <p className="stat-value">{value}</p>
    <p className="stat-label">{label}</p>
  </div>
);

export default function Dashboard() {
  const { courses, todayTasks, calendarEvents, statistics } = DASHBOARD_DATA;

  return (
    <main className="flex-1 dashboard-content">
      {/* Header Section */}
      <header className="dark-card p-6 mb-6 fade-in-up">
        <div>
          <h2 className="dashboard-title">Hello, Future Coder</h2>
          <p className="dashboard-subtitle mt-1">Ready to learn something new today?</p>
        </div>
        <button className="accent-button mt-4 sm:mt-0">
          Start Learning
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Today's Tasks */}
          <div className="dark-card p-6 fade-in-up">
            <h3 className="card-title">Tasks for today</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Statistics & Calendar */}
        <div className="space-y-6">
          {/* Quiz Statistics Section */}
          <QuizStatistics />

          {/* Calendar Section */}
          <div className="dark-card p-6 fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">Today's Calendar</h3>
              <span className="text-sm text-gray-400">Oct 20</span>
            </div>
            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <CalendarEventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}