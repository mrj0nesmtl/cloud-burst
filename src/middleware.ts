import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
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
  
  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    url.pathname = '/auth/signin'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }
  
  // If user is authenticated, check role-based access
  if (session && (isAdminRoute || isEventRoute)) {
    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const role = profile?.role || 'guest'
    
    // Admin routes are only accessible by super_admin and admin
    if (isAdminRoute && !['super_admin', 'admin'].includes(role)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Event management routes are only accessible by super_admin, admin, organizer, and event_host
    if (isEventRoute && !['super_admin', 'admin', 'organizer', 'event_host'].includes(role)) {
      url.pathname = '/protected/dashboard'
      return NextResponse.redirect(url)
    }
  }
  
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