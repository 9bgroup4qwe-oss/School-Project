'use client';

import { useState } from 'react';
import { Calendar, Clock, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';
import { TimetableWithAI } from './components/TimetableWithAI';
import { AuthenticatedSidebar } from '@/components/layout/AuthenticatedSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import '@/styles/timetable-base.css';
import '@/styles/timetable-grid.css';
import '@/styles/timetable-chat.css';
import '@/styles/timetable-upload.css';
import '@/styles/timetable-enhancements.css';
import '@/styles/timetable-interactive.css';
import '@/styles/timetable-progress.css';
import '@/styles/timetable-filters.css';
import '@/styles/timetable-list-view.css';
import '@/styles/timetable-notifications.css';

export default function TimetablePage() {
  return (
    <AuthGuard>
      <div className="timetable-container">
        <div className="timetable-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
        </div>

        <div className="timetable-content">
          <div className="flex min-h-[calc(100vh-2rem)]">
            <AuthenticatedSidebar activeItem="timetable" />

            <div className="flex-1">
              <TimetableWithAI />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}