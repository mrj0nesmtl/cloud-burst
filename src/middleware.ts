import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Define routes based on security standards
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
  '/marketing',
  '/event/[code]'
])

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })
  const pathname = request.nextUrl.pathname

  // Allow public routes without any checks
  if (PUBLIC_ROUTES.has(pathname)) {
    return res
  }

  // Await the getUser call to verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  // Handle authentication
  if (request.nextUrl.pathname.startsWith('/protected')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Handle auth pages when already logged in
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (user) {
      return NextResponse.redirect(new URL('/protected/dashboard', request.url))
    }
  }

  // If we have a session, allow access to protected routes
  if (user && pathname.startsWith('/protected')) {
    try {
      // Get user profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Add user context to headers
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', profile?.role || 'USER')

      // Super admin specific redirect
      if (profile?.role === 'SUPER_ADMIN' && pathname === '/protected/dashboard') {
        return NextResponse.redirect(new URL('/protected/admin/dashboard', request.url))
      }

      return response
    } catch (error) {
      // On error, still allow access with basic user role
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', 'USER')
      return response
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 