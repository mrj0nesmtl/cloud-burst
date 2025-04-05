import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track failed auth attempts to prevent infinite loops
const MAX_AUTH_RETRIES = 3
const authRetryKey = 'x-auth-retry-count'

// Define valid role types
type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest';

export async function middleware(request: NextRequest) {
  // Initialize Supabase middleware client
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Handle invitation token in query params - for magic link authentication flow
  const invitationToken = request.nextUrl.searchParams.get('invitation_token')
  
  if (invitationToken && session) {
    console.log('Found invitation token in URL - updating user metadata')
    
    try {
      // Update user metadata with invitation token
      await supabase.auth.updateUser({
        data: {
          invitation_token: invitationToken,
          source: 'invitation'
        }
      })
      
      // Get the invitation to update its status
      const { data: invitation } = await supabase
        .from('invitations')
        .select('id, status')
        .eq('token', invitationToken)
        .single()
      
      if (invitation) {
        // Update invitation status if needed
        if (invitation.status === 'pending' || invitation.status === 'sent') {
          await supabase
            .from('invitations')
            .update({
              status: 'opened',
              updated_at: new Date().toISOString()
            })
            .eq('token', invitationToken)
        }
      }
      
      // Remove token from URL to prevent repeated processing
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('invitation_token')
      return NextResponse.redirect(cleanUrl)
    } catch (error) {
      console.error('Error processing invitation token:', error)
    }
  }
  
  // Handle invitation links via /invite/:token
  if (request.nextUrl.pathname.startsWith('/invite/')) {
    const token = request.nextUrl.pathname.split('/invite/')[1]
    
    // Redirecting to our invitation handling page with the token
    return NextResponse.redirect(new URL(`/invitation/${token}`, request.url))
  }

  // Require authentication for auth-protected routes
  if (
    (request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/account') ||
    (request.nextUrl.pathname.startsWith('/events') && 
     request.nextUrl.pathname !== '/events') ||
    request.nextUrl.pathname.startsWith('/admin')) &&
    !session
  ) {
    // Auth required routes when not logged in redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Handle authenticated users trying to access login/register pages
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname === '/') &&
    session
  ) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // For API routes, check for authentication
  if (request.nextUrl.pathname.startsWith('/api/') && !session) {
    // Special cases for APIs that don't require authentication
    if (
      request.nextUrl.pathname.startsWith('/api/invitations/validate') ||
      request.nextUrl.pathname.startsWith('/api/invitations/[token]') ||
      request.nextUrl.pathname.startsWith('/api/auth/magic-link') ||
      request.nextUrl.pathname.startsWith('/api/invitation/')
    ) {
      return res
    }
    
    // Other APIs require authentication
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
  
  // For gallery viewing, check if the user is authorized or the gallery is public
  if (request.nextUrl.pathname.match(/\/events\/[^/]+\/gallery/)) {
    if (!session) {
      const eventId = request.nextUrl.pathname.split('/')[2]
      
      // Check if the gallery is public
      const { data: eventData, error } = await supabase
        .from('events')
        .select('is_public_gallery')
        .eq('id', eventId)
        .single()
      
      // If the gallery is not public, redirect to login
      if (!eventData?.is_public_gallery) {
        // Store the original URL to redirect back after login
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // User is logged in, check if they have access to this event
      const eventId = request.nextUrl.pathname.split('/')[2]
      const userId = session.user.id
      
      // First check if user is event owner
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('user_id')
        .eq('id', eventId)
        .single()
      
      if (eventData?.user_id === userId) {
        // User is event owner, allow access
        return res
      }
      
      // Check if user is an attendee
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (!attendeeData) {
        // Not an attendee either, check if gallery is public
        const { data: publicData, error } = await supabase
          .from('events')
          .select('is_public_gallery')
          .eq('id', eventId)
          .single()
        
        if (!publicData?.is_public_gallery) {
          // Gallery is not public and user is not authorized
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }
  
  return res
}

// Define which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * - _next (Next.js internals)
     * - API routes that don't require auth
     * - Static files (e.g. /favicon.ico, /static/*)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 