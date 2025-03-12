import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Track failed auth attempts to prevent infinite loops
const MAX_AUTH_RETRIES = 3
const authRetryKey = 'x-auth-retry-count'

// Define valid role types
type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest';

// Cache to reduce duplicate profile lookups
const profileRoleCache = new Map<string, string>()

export async function middleware(req: NextRequest) {
  // Skip middleware only during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next()
  }
  
  const res = NextResponse.next()
  
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
  
  // If this is a public route, skip authentication checks
  if (isPublicRoute) {
    return res
  }
  
  // Protected routes that require authentication
  const isProtectedRoute = path.startsWith('/protected/')
  
  // If not a protected route, no need to check auth
  if (!isProtectedRoute) {
    return res
  }
  
  // Bypass auth in development mode if enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    console.log('Development mode: Bypassing authentication middleware')
    return NextResponse.next()
  }
  
  // Check for auth retry count to prevent infinite loops
  const retryCount = parseInt(req.headers.get(authRetryKey) || '0')
  if (retryCount >= MAX_AUTH_RETRIES) {
    console.warn('Max auth retries reached, redirecting to sign in page')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set('error', 'session_error')
    return NextResponse.redirect(redirectUrl)
  }
  
  // Increment retry count
  res.headers.set(authRetryKey, (retryCount + 1).toString())
  
  // Admin routes that require admin privileges
  const isAdminRoute = path.startsWith('/protected/admin/')
  
  // Event management routes
  const isEventRoute = path.startsWith('/protected/events/')
  
  const supabase = createMiddlewareClient({ req, res })
  
  // Try to get the session, with error handling
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      throw error
    }
    
    const session = data.session
    
    // If user is not authenticated, redirect to sign in
    if (!session) {
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectTo', path)
      return NextResponse.redirect(url)
    }
    
    // If user is authenticated and this isn't an admin or event route, allow access
    if (!(isAdminRoute || isEventRoute)) {
      // Reset retry count on successful auth
      res.headers.delete(authRetryKey)
      return res
    }
    
    // Get user ID from session for role check
    const userId = session.user.id
    if (!userId) {
      throw new Error('User ID is missing from session')
    }
    
    // Try to get role from cache first
    let userRole: UserRole = 'guest' // Default to guest if no role found
    
    if (profileRoleCache.has(userId)) {
      // If role is in cache, use it (with proper type casting)
      const cachedRole = profileRoleCache.get(userId)
      if (cachedRole) {
        userRole = cachedRole as UserRole
      }
    } else {
      // If not in cache, fetch from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw profileError
      }
      
      // Set role with fallback to guest if undefined
      const fetchedRole = profile?.role || 'guest'
      userRole = fetchedRole as UserRole
      
      // Cache the role to reduce future API calls (now properly typed as string)
      profileRoleCache.set(userId, userRole)
    }
    
    // Admin routes are only accessible by super_admin and admin
    if (isAdminRoute && !['super_admin', 'admin'].includes(userRole)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Event management routes are only accessible by super_admin, admin, organizer, and event_host
    if (isEventRoute && !['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
    
    // If we've made it this far, allow access
    res.headers.delete(authRetryKey) // Reset retry count
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