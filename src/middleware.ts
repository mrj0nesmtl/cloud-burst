import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track failed auth attempts to prevent infinite loops
const MAX_AUTH_RETRIES = 3
const authRetryKey = 'x-auth-retry-count'

// Define valid role types
type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Check if user is authenticated
  const isAuthenticated = !!session
  const pathname = req.nextUrl.pathname
  
  // Protected routes that require authentication
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/protected') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/events') && !pathname.includes('/gallery')
  ) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    // Get user role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single()
    
    const userRole = profile?.role
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
  
  // Event management routes - check event-specific permissions
  if (pathname.startsWith('/events/') && !pathname.includes('/gallery') && !pathname.includes('/register')) {
    // Extract event ID from URL
    const eventId = pathname.split('/')[2]
    
    if (eventId && isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if user is event owner
      const { data: event } = await supabase
        .from('events')
        .select('organizer_id')
        .eq('id', eventId)
        .single()
      
      if (event?.organizer_id === user?.id) {
        // User is event owner, allow access
        return res
      }
      
      // Check if user is event staff/host for this event
      const { data: staffRole } = await supabase
        .from('event_staff')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single()
      
      if (staffRole) {
        // User has staff or host access to this event
        return res
      }
      
      // Check if user is admin or super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()
      
      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        // Admins can access any event
        return res
      }
      
      // User doesn't have permission to access this event
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
  
  return res
}

// Define which routes should be processed by this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/events/:path*', 
    '/protected/:path*',
  ],
} 