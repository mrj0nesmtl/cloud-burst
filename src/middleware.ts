import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track failed auth attempts to prevent infinite loops
const MAX_AUTH_RETRIES = 3
const authRetryKey = 'x-auth-retry-count'

// Define valid role types
type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest';

export async function middleware(req: NextRequest) {
  // Skip middleware only during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next()
  }
  
  const res = NextResponse.next()
  
  // Get URL information
  const url = req.nextUrl.clone()
  const path = url.pathname
  
  // Create Supabase client for all routes
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if there are auth error parameters
  const hasAuthError = url.searchParams.has('error') && 
    url.searchParams.has('error_code');

  if (hasAuthError) {
    // Redirect to our error page with the error parameters
    const errorParams = new URLSearchParams();
    errorParams.set('error', url.searchParams.get('error') || '');
    errorParams.set('error_code', url.searchParams.get('error_code') || '');
    errorParams.set('error_description', url.searchParams.get('error_description') || '');
    
    return NextResponse.redirect(
      new URL(`/auth/error?${errorParams.toString()}`, req.url)
    );
  }

  // Try to get the session for all routes
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      throw error
    }

    // Public routes that don't require authentication
    const isPublicRoute = 
      path === '/' || 
      path.startsWith('/auth/') || 
      path.startsWith('/public/') ||
      path.startsWith('/_next/') ||
      path.startsWith('/api/public/')
    
    // For public routes, maintain session state but don't enforce auth
    if (isPublicRoute) {
      // If user is already authenticated and trying to access signin page, redirect to dashboard
      if (session && path.startsWith('/auth/signin')) {
        const redirectUrl = new URL('/protected/dashboard', req.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      if (session) {
        // Attach session info to response
        res.headers.set('x-user-authenticated', 'true')
      }
      return res
    }

    // Protected routes that require authentication
    const isProtectedRoute = path.startsWith('/protected/')
    
    // If not a protected route, no need to check auth
    if (!isProtectedRoute) {
      return res
    }

    // If user is not authenticated, redirect to sign in
    if (!session) {
      // Don't increment retry count for initial auth redirect
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('returnTo', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Check for auth retry count to prevent infinite loops
    const retryCount = parseInt(req.headers.get(authRetryKey) || '0')
    if (retryCount >= MAX_AUTH_RETRIES) {
      console.warn('Max auth retries reached, redirecting to sign in page')
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('error', 'session_error')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Increment retry count only for subsequent auth checks
    res.headers.set(authRetryKey, (retryCount + 1).toString())
    
    // Get user's profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    // Get user role from profile or default to guest
    const userRole = (profile?.role as UserRole) || 'guest'
    
    // Admin routes are only accessible by super_admin and admin
    const isAdminRoute = path.startsWith('/protected/admin/')
    if (isAdminRoute && !['super_admin', 'admin'].includes(userRole)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Event management routes are only accessible by super_admin, admin, organizer, and event_host
    const isEventRoute = path.startsWith('/protected/events/')
    if (isEventRoute && !['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
    
    // If we've made it this far, allow access
    res.headers.delete(authRetryKey) // Reset retry count
    res.headers.set('x-user-role', userRole) // Attach role to response
    return res
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    // Redirect to sign in page
    url.pathname = '/auth/signin'
    url.searchParams.set('error', 'session_error')
    return NextResponse.redirect(url)
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 