import { TimetableData, APIResponse, APIError } from '@/types/timetable';
import { TimetableSync } from '@/utils/timetableSync';

class TimetableAPI {
  private baseURL = '/api/timetable';

  /**
   * Load the active timetable from backend with localStorage fallback
   */
  async loadActiveTimetable(): Promise<TimetableData | null> {
    try {
      // Try to load from backend first
      const response = await fetch(`${this.baseURL}?includeInactive=false&limit=1`);
      const result: APIResponse<TimetableData[]> = await response.json();

      if (result.data && result.data.length > 0) {
        return result.data[0];
      } else {
        // Fallback to localStorage
        return TimetableSync.getFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading active timetable:', error);
      // Fallback to localStorage
      return TimetableSync.getFromLocalStorage();
    }
  }

  /**
   * Save timetable to backend with localStorage fallback
   */
  async saveTimetable(
    timetableData: Partial<TimetableData>,
    timetableId?: string
  ): Promise<TimetableData> {
    const url = timetableId ? `${this.baseURL}/${timetableId}` : this.baseURL;
    const method = timetableId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...timetableData,
          metadata: {
            ...timetableData.metadata,
            title: timetableData.metadata?.title || 'AI Generated Timetable'
          },
          is_active: true
        })
      });

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON safely
      let result: APIResponse<TimetableData>;
      try {
        const responseText = await response.text();
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid response from server');
      }

      const { data, error } = result;

      if (error) {
        // Check if backend is not available
        if (this.isBackendUnavailable(error)) {
          return this.saveToLocalStorage(timetableData, 'backend_unavailable');
        }

        // For other errors, also fallback to localStorage
        return this.saveToLocalStorage(
          { ...timetableData, backend_error: error },
          'backend_error'
        );
      }

      // Success - remove from localStorage if saved to backend
      TimetableSync.removeFromLocalStorage();
      return data!;

    } catch (error) {
      console.error('Error saving timetable:', error);
      // Fallback to localStorage for any error
      return this.saveToLocalStorage(
        { ...timetableData, fallback_reason: error instanceof Error ? error.message : String(error) },
        'network_error'
      );
    }
  }

  /**
   * Update timetable with AI response
   */
  async updateTimetableWithAI(
    message: string,
    currentTimetable: TimetableData | null
  ): Promise<{ response: string; timetable?: TimetableData }> {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/timetable/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          currentTimetable
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Export timetable in different formats
   */
  async exportTimetable(timetableId: string, format: 'json' | 'csv' | 'ical'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}/${timetableId}/export?format=${format}`);

      if (!response.ok) {
        throw new Error(`Failed to export timetable: ${response.statusText}`);
      }

      return await response.blob();

    } catch (error) {
      console.error('Error exporting timetable:', error);
      throw new Error('Failed to export timetable');
    }
  }

  /**
   * Delete timetable
   */
  async deleteTimetable(timetableId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${timetableId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete timetable: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw new Error('Failed to delete timetable');
    }
  }

  /**
   * Check if backend is unavailable based on error
   */
  private isBackendUnavailable(error: APIError): boolean {
    return !!(
      error?.message === 'User not authenticated' ||
      error?.code === 'PGRST301' ||
      error?.needsMigration ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('permission denied')
    );
  }

  /**
   * Save to localStorage with metadata
   */
  private saveToLocalStorage(
    timetableData: Partial<TimetableData>,
    reason: string
  ): TimetableData {
    const localData = TimetableSync.saveToLocalStorage({
      ...timetableData,
      saved_to: 'localStorage',
      fallback_reason: reason,
      metadata: {
        ...timetableData.metadata,
        updatedAt: new Date()
      }
    });

    return localData;
  }

  /**
   * Validate API response
   */
  private validateResponse<T>(response: any, validator: (obj: any) => obj is T): T {
    if (!validator(response)) {
      throw new Error('Invalid response format');
    }
    return response;
  }
}

// Export singleton instance
export const timetableAPI = new TimetableAPI();