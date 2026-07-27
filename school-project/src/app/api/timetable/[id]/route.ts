import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('shareToken');

    // Get by share token
    if (shareToken) {
      const result = await timetableService.getTimetableByShareToken(shareToken);
      return NextResponse.json(result);
    }

    // Get by ID
    const result = await timetableService.getTimetableById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/timetable/[id]:', error);
    return NextResponse.json({
      data: null,
      error: {
        message: error?.message || 'Internal server error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      }
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await timetableService.updateTimetable(id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/timetable/[id]:', error);
    return NextResponse.json({
      data: null,
      error: {
        message: error?.message || 'Internal server error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await timetableService.deleteTimetable(id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/timetable/[id]:', error);
    return NextResponse.json({
      data: null,
      error: {
        message: error?.message || 'Internal server error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      }
    }, { status: 500 });
  }
}