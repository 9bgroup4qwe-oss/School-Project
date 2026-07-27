import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await timetableService.generateShareToken(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/timetable/[id]/share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}