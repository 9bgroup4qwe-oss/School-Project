import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await timetableService.getTimetableHistory(params.id, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/timetable/[id]/history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}