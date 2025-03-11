import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track failed auth attempts to prevent infinite loops
const MAX_AUTH_RETRIES = 3
const authRetryKey = 'x-auth-retry-count'

export async function middleware(req: NextRequest) {
  // Skip middleware only during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next()
  }
  
  const res = NextResponse.next()
  
  // Check for auth retry count to prevent infinite loops
  const retryCount = parseInt(req.headers.get(authRetryKey) || '0')
  if (retryCount >= MAX_AUTH_RETRIES) {
    console.warn('Max auth retries reached, redirecting to sign in page')
    const url = req.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('error', 'session_error')
    return NextResponse.redirect(url)
  }
  
  // Increment retry count
  res.headers.set(authRetryKey, (retryCount + 1).toString())
  
  const supabase = createMiddlewareClient({ req, res })
  
  // Get URL information
  const url = req.nextUrl.clone()
  const path = url.pathname
  
  // Public routes that don't require authentication
  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/auth/') || 
    path.startsWith('/public/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/public/')
  
  // Protected routes that require authentication
  const isProtectedRoute = path.startsWith('/protected/')
  
  // Admin routes that require admin privileges
  const isAdminRoute = path.startsWith('/protected/admin/')
  
  // Event management routes
  const isEventRoute = path.startsWith('/protected/events/')
  
  // Try to get the session, with error handling
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error('Error getting session:', error)
    
    // Only redirect on protected routes
    if (isProtectedRoute) {
      url.pathname = '/auth/signin'
      url.searchParams.set('error', 'session_error')
      return NextResponse.redirect(url)
    }
    
    // For public routes, just continue
    return res
  }
  
  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    // In development mode, allow access to protected routes for testing
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.log('Development mode: Allowing access to protected route without authentication');
      return NextResponse.next()
    }
    
    url.pathname = '/auth/signin'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }
  
  // If user is authenticated, check role-based access
  if (session && (isAdminRoute || isEventRoute)) {
    try {
      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      const role = profile?.role || 'guest'
      
      // Admin routes are only accessible by super_admin and admin
      if (isAdminRoute && !['super_admin', 'admin'].includes(role)) {
        // In development mode, allow access to admin routes for testing
        if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
          console.log('Development mode: Allowing access to admin route without proper role');
          return NextResponse.next()
        }
        
        url.pathname = '/protected/dashboard'
        return NextResponse.redirect(url)
      }
      
      // Event management routes are only accessible by super_admin, admin, organizer, and event_host
      if (isEventRoute && !['super_admin', 'admin', 'organizer', 'event_host'].includes(role)) {
        // In development mode, allow access to event routes for testing
        if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
          console.log('Development mode: Allowing access to event route without proper role');
          return NextResponse.next()
        }
        
        url.pathname = '/protected/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      
      // If we can't check the role, redirect to dashboard
      if (isAdminRoute || isEventRoute) {
        url.pathname = '/protected/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }
  
  // Reset retry count on successful auth
  res.headers.delete(authRetryKey)
  
  return res
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