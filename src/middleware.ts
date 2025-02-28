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

const PROTECTED_ROUTES = {
  ADMIN: ['/protected/admin'],
  EVENT_MANAGER: [
    '/protected/events/manage',
    '/protected/events/create',
    '/protected/events/moderate'
  ],
  USER: [
    '/protected/dashboard',
    '/protected/profile',
    '/protected/settings',
    '/protected/gallery'
  ],
  ALL: ['/protected']
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Check session and get profile in one go
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Allow public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return res
  }

  // Require auth for protected routes
  if (pathname.startsWith('/protected')) {
    if (!session) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'USER'

    // Admin routes protection
    if (pathname.startsWith('/protected/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/protected/dashboard', req.url))
    }

    // Event manager routes protection
    if (
      pathname.startsWith('/protected/events/manage') && 
      !['ADMIN', 'EVENT_MANAGER'].includes(userRole)
    ) {
      return NextResponse.redirect(new URL('/protected/dashboard', req.url))
    }

    // Ensure basic user access
    if (!PROTECTED_ROUTES[userRole]?.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/protected/dashboard', req.url))
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
  ]
} 