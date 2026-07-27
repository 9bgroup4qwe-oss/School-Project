import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Apply session update for API routes that need authentication
  if (request.nextUrl.pathname.startsWith('/api/timetable')) {
    return await updateSession(request)
  }

  // Skip middleware for auth page
  if (request.nextUrl.pathname === '/auth') {
    return NextResponse.next()
  }

  // Skip middleware for home page
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  // Update session for authenticated routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}