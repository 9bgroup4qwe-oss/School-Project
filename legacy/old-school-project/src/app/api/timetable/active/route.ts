import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, setActive } = body;

    // Get current active timetables and deactivate them
    const { data: currentActive } = await timetableService.getTimetables({
      includeInactive: false,
      limit: 100
    });

    if (currentActive) {
      for (const timetable of currentActive) {
        if (timetable.id !== id) {
          await timetableService.updateTimetable(timetable.id!, {
            is_active: false
          });
        }
      }
    }

    // Set the new active timetable
    if (id) {
      const result = await timetableService.updateTimetable(id, {
        is_active: setActive ?? true
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/timetable/active:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}