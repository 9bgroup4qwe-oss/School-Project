import { NextRequest, NextResponse } from 'next/server';
import timetableService from '@/services/timetableService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await timetableService.getPublicTemplates(category, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/timetable/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}