import { NextRequest, NextResponse } from 'next/server';
import timetableService, { TimetableData } from '@/services/timetableService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const includePublic = searchParams.get('includePublic') === 'true';

    // Handle search
    if (search) {
      const result = await timetableService.searchTimetables(search, {
        includePublic,
        limit
      });
      return NextResponse.json(result);
    }

    // Get regular list
    const result = await timetableService.getTimetables({
      includeInactive,
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/timetable:', error);
    // Pass through the actual error for better debugging
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

export async function POST(request: NextRequest) {
  try {
    // Check if request has content
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({
        data: null,
        error: {
          message: 'Content-Type must be application/json',
          code: 'INVALID_CONTENT_TYPE'
        }
      }, { status: 400 });
    }

    // Parse JSON with error handling
    let body;
    try {
      const text = await request.text();
      if (!text.trim()) {
        return NextResponse.json({
          data: null,
          error: {
            message: 'Request body cannot be empty',
            code: 'EMPTY_BODY'
          }
        }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({
        data: null,
        error: {
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
          details: parseError.message
        }
      }, { status: 400 });
    }

    const { fromTemplate, ...timetableData } = body;

    // If no data provided, create a default timetable
    if (!timetableData || Object.keys(timetableData).length === 0) {
      return NextResponse.json({
        data: {
          id: 'local-' + Date.now(),
          title: 'My Timetable',
          saved_to: 'localStorage',
          schedule: {},
          metadata: {},
          settings: {}
        },
        error: null
      });
    }

    // Create from template
    if (fromTemplate) {
      try {
        const result = await timetableService.createFromTemplate(
          fromTemplate,
          timetableData.title
        );
        if (!result || (!result.data && !result.error)) {
          // Fallback response
          return NextResponse.json({
            data: {
              id: 'local-' + Date.now(),
              title: timetableData.title || 'My Timetable',
              saved_to: 'localStorage',
              ...timetableData
            },
            error: null
          });
        }
        return NextResponse.json(result);
      } catch (serviceError) {
        console.error('Service error creating from template:', serviceError);
        // Fallback response
        return NextResponse.json({
          data: {
            id: 'local-' + Date.now(),
            title: timetableData.title || 'My Timetable',
            saved_to: 'localStorage',
            ...timetableData
          },
          error: null
        });
      }
    }

    // Create regular timetable
    let result;
    try {
      result = await timetableService.createTimetable(timetableData);
    } catch (serviceError) {
      console.error('Service error creating timetable:', serviceError);
      result = null;
    }

    // Ensure we always return a valid response
    if (!result || (!result.data && !result.error)) {
      return NextResponse.json({
        data: {
          id: 'local-' + Date.now(),
          title: timetableData.title || 'My Timetable',
          saved_to: 'localStorage',
          is_active: true,
          is_favorite: false,
          metadata: timetableData.metadata || {},
          schedule: timetableData.schedule || {},
          settings: timetableData.settings || {},
          ...timetableData
        },
        error: null
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/timetable:', error);
    // Pass through the actual error for better debugging
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