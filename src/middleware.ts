import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

// Define basic routes based on beta security standards
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/register',
  '/auth/reset-password'
]

const PROTECTED_ROUTES = [
  '/dashboard',
  '/events',
  '/admin',
  '/settings',
  '/profile'
]

export async function middleware(request: NextRequest) {
  try {
    // Create response and client
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Add basic security headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname

    // Allow public routes and dynamic event routes
    if (PUBLIC_ROUTES.includes(path) || path.startsWith('/event/')) {
      return res
    }

    // Check auth for protected routes and their dynamic variants
    if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
      if (!session) {
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('returnTo', path)
        return NextResponse.redirect(loginUrl)
      }

      // Basic role check for admin routes
      if (path.startsWith('/admin') && 
          session.user.user_metadata.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 