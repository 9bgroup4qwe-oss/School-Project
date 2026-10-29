'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Clock, BookOpen, Coffee, Settings, Volume2, VolumeX } from 'lucide-react';
import { TimetableData, TimetableSlot } from '@/types/timetable';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'study' | 'break' | 'meal' | 'reminder';
  time: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  timetable: TimetableData | null;
}

export function NotificationSystem({ timetable }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderSettings, setReminderSettings] = useState({
    studyReminder: true,
    breakReminder: true,
    mealReminder: true,
    advanceNotice: 15 // minutes
  });

  // Check for upcoming activities and create notifications
  const checkUpcomingActivities = useCallback(() => {
    if (!timetable) return;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    const todaySchedule = timetable.schedule[currentDay];
    if (!todaySchedule) return;

    todaySchedule.forEach(slot => {
      const [slotStart] = slot.time.split('-');
      const [hours, minutes] = slotStart.split(':').map(Number);
      const slotTimeInMinutes = hours * 60 + minutes;
      const timeDifference = slotTimeInMinutes - currentTime;

      // Check if activity is within the reminder window
      if (timeDifference > 0 && timeDifference <= reminderSettings.advanceNotice) {
        const notificationId = `${slot.time}_${slot.activity}_${now.getDate()}`;

        // Check if notification already exists
        const exists = notifications.some(n => n.id === notificationId);
        if (!exists) {
          createNotification(slot, timeDifference);
        }
      }
    });
  }, [timetable, reminderSettings, notifications]);

  // Create a new notification
  const createNotification = (slot: TimetableSlot, minutesUntil: number) => {
    const notification: Notification = {
      id: `${slot.time}_${slot.activity}_${new Date().getDate()}`,
      title: `Upcoming ${slot.type}`,
      message: `${slot.activity} starts in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}${slot.location ? ` at ${slot.location}` : ''}`,
      type: slot.type as any,
      time: slot.time,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep max 50 notifications

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6IzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors from autoplay policy
      });
    } catch (e) {
      // Fallback if sound fails
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(prev => [...prev, {
          id: 'permission-granted',
          title: 'Notifications Enabled',
          message: 'You will receive desktop notifications for upcoming activities',
          type: 'reminder',
          time: '',
          timestamp: new Date(),
          read: false
        }]);
      }
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen;
      case 'meal': return Coffee;
      case 'break': return Clock;
      default: return Bell;
    }
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'study': return 'text-blue-600 bg-blue-50';
      case 'meal': return 'text-yellow-600 bg-yellow-50';
      case 'break': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Check for notifications every minute
  useEffect(() => {
    requestNotificationPermission();

    const interval = setInterval(() => {
      checkUpcomingActivities();
    }, 60000); // Check every minute

    // Initial check
    checkUpcomingActivities();

    return () => clearInterval(interval);
  }, [checkUpcomingActivities]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-system">
      {/* Notification Bell */}
      <div className="notification-bell">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bell-button"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {/* Settings */}
        <div className="notification-settings">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="setting-button"
            title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3 className="notifications-title">Notifications</h3>
            <div className="notifications-actions">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="action-link"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="action-link"
                  >
                    Clear all
                  </button>
                </>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="close-button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell className="w-12 h-12 text-gray-400" />
                <p>No notifications yet</p>
                <p className="text-sm text-gray-500">
                  You'll see reminders for upcoming activities here
                </p>
              </div>
            ) : (
              notifications.map(notification => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`notification-icon ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {notification.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="remove-button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Settings Summary */}
          <div className="notifications-settings-summary">
            <div className="settings-item">
              <span className="settings-label">Study reminders</span>
              <span className={`settings-value ${reminderSettings.studyReminder ? 'enabled' : 'disabled'}`}>
                {reminderSettings.studyReminder ? 'On' : 'Off'}
              </span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Notify before</span>
              <span className="settings-value">{reminderSettings.advanceNotice} min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}