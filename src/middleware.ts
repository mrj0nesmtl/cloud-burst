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
  
  console.log(`Middleware processing: ${pathname} - User authenticated: ${isAuthenticated}`);
  
  // Guest dashboard route - check if user has a guest profile
  if (pathname.startsWith('/guest/dashboard')) {
    const token = req.nextUrl.searchParams.get('token')
    
    if (!token) {
      console.log('No token provided for guest dashboard access');
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    try {
      // First, check if the invitation is valid
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, email, name')
        .eq('token', token)
        .single();

      if (invitationError || !invitation) {
        console.log('Invalid invitation token for guest dashboard', invitationError);
        return NextResponse.redirect(new URL('/invitation/invalid', req.url))
      }
      
      // Now check if guest profile exists for this invitation
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('id, name, email')
        .eq('invitation_id', invitation.id)
        .maybeSingle();
      
      if (guestError || !guest) {
        console.log('No guest profile found, redirecting to profile setup');
        // Redirect to profile setup, passing the token
        const profileUrl = new URL(`/guest/profile`, req.url)
        profileUrl.searchParams.set('token', token)
        return NextResponse.redirect(profileUrl)
      }
      
      // Guest exists, allow access to dashboard
      return res
    } catch (error) {
      console.error('Error checking guest profile:', error);
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  // Protected routes that require authentication
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/protected') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/events') && !pathname.includes('/gallery')
  ) {
    if (!isAuthenticated) {
      console.log('User not authenticated for protected route:', pathname);
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Diagnostic routes - require super_admin role
  if (pathname.includes('/diagnostic') || pathname.includes('/diagnostic/')) {
    console.log('Processing diagnostic route:', pathname);
    
    if (!isAuthenticated) {
      console.log('User not authenticated for diagnostic route:', pathname);
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Get user role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single()
    
    const userRole = profile?.role
    console.log(`Diagnostic route access: ${pathname} - User role: ${userRole}`);
    
    // Allow both super_admin and admin roles to access diagnostic routes
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      console.log('Unauthorized user attempted to access diagnostic route:', pathname);
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    // Admin or Super admin accessing diagnostic route is allowed
    return res
  }
  
  // Admin routes - require admin role
  if (pathname.startsWith('/admin') || pathname.startsWith('/protected/admin')) {
    // Skip if already processed as a diagnostic route
    if (pathname.includes('/diagnostic')) {
      return res;
    }

    // Get user role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single()
    
    const userRole = profile?.role
    console.log(`Admin route access: ${pathname} - User role: ${userRole}`);
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      console.log('Unauthorized admin access attempt:', pathname, 'User role:', userRole);
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
    '/guest/dashboard/:path*',
  ],
} 