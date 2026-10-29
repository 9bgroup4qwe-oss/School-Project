import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const result = await timetableService.exportTimetable(params.id, format as 'json' | 'ical');

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Set appropriate headers for the response
    if (format === 'ical') {
      return new NextResponse(result.data, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': `attachment; filename="timetable-${params.id}.ics"`
        }
      });
    } else {
      return new NextResponse(JSON.stringify(result.data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="timetable-${params.id}.json"`
        }
      });
    }
  } catch (error) {
    console.error('Error in GET /api/timetable/[id]/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}