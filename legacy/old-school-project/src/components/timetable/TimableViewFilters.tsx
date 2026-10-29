'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Grid3x3, List, Calendar, Clock, BookOpen, Coffee, Dumbbell, Music, User, Search } from 'lucide-react';
import { TimetableData, TimetableSlot, ActivityType } from '@/types/timetable';

interface TimableViewFiltersProps {
  timetable: TimetableData;
  onFilteredData: (filtered: TimetableData) => void;
  onViewModeChange?: (viewMode: ViewMode) => void;
}

type ViewMode = 'grid' | 'list' | 'calendar';
type FilterType = 'all' | 'study' | 'class' | 'meal' | 'break' | 'activity' | 'personal';

const ACTIVITY_FILTERS = [
  { value: 'all', label: 'All Activities', icon: Grid3x3 },
  { value: 'study', label: 'Study Only', icon: BookOpen },
  { value: 'class', label: 'Classes Only', icon: User },
  { value: 'meal', label: 'Meals Only', icon: Coffee },
  { value: 'break', label: 'Breaks Only', icon: Clock },
  { value: 'activity', label: 'Activities Only', icon: Dumbbell },
  { value: 'personal', label: 'Personal Only', icon: User }
];

export function TimableViewFilters({ timetable, onFilteredData, onViewModeChange }: TimableViewFiltersProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Handle view mode change
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    onViewModeChange?.(newMode);
  };

  // Sync view mode with parent
  useEffect(() => {
    // Optional: You can pass the current view mode from parent as a prop
    // For now, we'll keep local state
  }, []);

  // Get unique days from timetable
  const availableDays = useMemo(() => {
    const days = Object.keys(timetable.schedule);
    return days.sort();
  }, [timetable]);

  // Filter and search logic
  const filteredTimetable = useMemo(() => {
    let filtered = { ...timetable };

    // Filter by activity type
    if (activeFilter !== 'all') {
      const newSchedule: any = {};
      Object.entries(filtered.schedule).forEach(([day, slots]) => {
        const filteredSlots = slots.filter(slot => slot.type === activeFilter);
        if (filteredSlots.length > 0) {
          newSchedule[day] = filteredSlots;
        }
      });
      filtered.schedule = newSchedule;
    }

    // Filter by day
    if (selectedDay !== 'all') {
      const newSchedule: any = {};
      if (filtered.schedule[selectedDay]) {
        newSchedule[selectedDay] = filtered.schedule[selectedDay];
      }
      filtered.schedule = newSchedule;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const newSchedule: any = {};
      Object.entries(filtered.schedule).forEach(([day, slots]) => {
        const filteredSlots = slots.filter(slot =>
          slot.activity.toLowerCase().includes(query) ||
          (slot.location && slot.location.toLowerCase().includes(query))
        );
        if (filteredSlots.length > 0) {
          newSchedule[day] = filteredSlots;
        }
      });
      filtered.schedule = newSchedule;
    }

    return filtered;
  }, [timetable, activeFilter, searchQuery, selectedDay]);

  // Call onFilteredData when filteredTimetable changes
  useEffect(() => {
    onFilteredData(filteredTimetable);
  }, [filteredTimetable]); // Remove onFilteredData from dependencies

  // Get statistics
  const stats = useMemo(() => {
    let totalActivities = 0;
    let totalStudyHours = 0;
    const activityCounts: Record<string, number> = {};

    Object.entries(timetable.schedule).forEach(([day, slots]) => {
      slots.forEach(slot => {
        totalActivities++;
        activityCounts[slot.type] = (activityCounts[slot.type] || 0) + 1;

        if (slot.type === 'study') {
          const [start, end] = slot.time.split('-');
          const [startHour] = start.split(':').map(Number);
          const [endHour] = end.split(':').map(Number);
          totalStudyHours += endHour - startHour;
        }
      });
    });

    return {
      totalActivities,
      totalStudyHours,
      activityCounts
    };
  }, [timetable]);

  return (
    <div className="timetable-filters">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="view-mode-section">
        <h4 className="filter-label">View Mode</h4>
        <div className="view-modes">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => handleViewModeChange('calendar')}
            className={`view-mode-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Activity Type Filters */}
      <div className="filter-section">
        <h4 className="filter-label">
          <Filter className="w-4 h-4" />
          Activity Type
        </h4>
        <div className="filter-grid">
          {ACTIVITY_FILTERS.map(filter => {
            const Icon = filter.icon;
            const count = filter.value === 'all'
              ? stats.totalActivities
              : stats.activityCounts[filter.value] || 0;

            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value as FilterType)}
                className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{filter.label}</span>
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Filter */}
      <div className="filter-section">
        <h4 className="filter-label">Filter by Day</h4>
        <div className="day-filter">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="day-select"
          >
            <option value="all">All Days</option>
            {availableDays.map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="stats-summary">
        <h4 className="filter-label">Summary</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalActivities}</span>
            <span className="stat-label">Total Activities</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalStudyHours}h</span>
            <span className="stat-label">Study Hours</span>
          </div>
          {Object.entries(stats.activityCounts).map(([type, count]) => {
            const filter = ACTIVITY_FILTERS.find(f => f.value === type);
            if (!filter) return null;
            const Icon = filter.icon;
            return (
              <div key={type} className="stat-card">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="stat-value">{count}</span>
                <span className="stat-label">{filter.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilter !== 'all' || selectedDay !== 'all' || searchQuery) && (
        <div className="active-filters">
          <h4 className="filter-label">Active Filters</h4>
          <div className="active-filter-tags">
            {activeFilter !== 'all' && (
              <span className="filter-tag">
                {ACTIVITY_FILTERS.find(f => f.value === activeFilter)?.label}
                <button
                  onClick={() => setActiveFilter('all')}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            )}
            {selectedDay !== 'all' && (
              <span className="filter-tag">
                {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
                <button
                  onClick={() => setSelectedDay('all')}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="filter-tag">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedDay('all');
                setSearchQuery('');
              }}
              className="clear-all-btn"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Export/Share Options */}
      <div className="export-section">
        <h4 className="filter-label">Export</h4>
        <div className="export-buttons">
          <button className="export-btn">
            Export as PDF
          </button>
          <button className="export-btn">
            Share Link
          </button>
          <button className="export-btn">
            Print
          </button>
        </div>
      </div>
    </div>
  );
}