// Timetable Sync Utilities
// Handles syncing between localStorage and Supabase

interface TimetableData {
  id?: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_favorite: boolean;
  metadata: Record<string, any>;
  schedule: Record<string, Array<any>>;
  settings: Record<string, any>;
  saved_to?: 'localStorage' | 'supabase';
  created_at?: string;
  updated_at?: string;
}

const LOCAL_STORAGE_KEY = 'timetable_draft';
const SYNC_QUEUE_KEY = 'timetable_sync_queue';

export class TimetableSync {
  // Save to localStorage with metadata
  static saveToLocalStorage(timetable: Partial<TimetableData>): TimetableData {
    const data = {
      ...timetable,
      id: timetable.id || Date.now().toString(),
      saved_to: 'localStorage',
      created_at: timetable.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

    // Add to sync queue for later
    this.addToSyncQueue('upsert', data);

    return data;
  }

  // Get from localStorage
  static getFromLocalStorage(): TimetableData | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return null;
  }

  // Remove from localStorage
  static removeFromLocalStorage(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  // Add item to sync queue
  private static addToSyncQueue(action: 'upsert' | 'delete', data: any): void {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        action,
        data,
        timestamp: Date.now()
      });
      // Keep only last 10 items in queue
      if (queue.length > 10) {
        queue.splice(0, queue.length - 10);
      }
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Get sync queue
  static getSyncQueue(): Array<{action: string; data: any; timestamp: number}> {
    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  }

  // Clear sync queue
  static clearSyncQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }

  // Check if localStorage has data that needs syncing
  static needsSync(): boolean {
    const data = this.getFromLocalStorage();
    return !!(data && data.saved_to === 'localStorage');
  }

  // Merge local and remote timetables
  static mergeTimetables(localTimetable: TimetableData, remoteTimetable: TimetableData): TimetableData {
    // If remote is newer, use it
    if (remoteTimetable.updated_at && localTimetable.updated_at) {
      if (new Date(remoteTimetable.updated_at) > new Date(localTimetable.updated_at)) {
        return {
          ...remoteTimetable,
          saved_to: 'supabase'
        };
      }
    }

    // If local is newer or no remote, use local
    return {
      ...localTimetable,
      saved_to: 'localStorage',
      needs_sync: true
    };
  }

  // Get display message based on storage location
  static getStorageMessage(timetable: TimetableData): string {
    if (!timetable) return 'No timetable';

    if (timetable.saved_to === 'localStorage') {
      return 'Saved locally (offline)';
    }

    if (timetable.saved_to === 'supabase') {
      return 'Saved to cloud';
    }

    return 'Saved';
  }
}