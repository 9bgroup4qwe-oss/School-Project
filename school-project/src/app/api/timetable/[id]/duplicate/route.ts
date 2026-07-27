import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title } = body;

    const result = await timetableService.duplicateTimetable(
      params.id,
      title
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/timetable/[id]/duplicate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}