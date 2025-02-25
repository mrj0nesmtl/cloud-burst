import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

// Define routes as static arrays
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/signin',
  '/auth/register',
  '/auth/reset-password'
])

const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/events',
  '/admin',
  '/settings',
  '/profile'
])

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Add security headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    const { data: { session } } = await supabase.auth.getSession()
    const path = request.nextUrl.pathname

    // Check public routes
    if (PUBLIC_ROUTES.has(path) || path.startsWith('/event/')) {
      return res
    }

    // Check protected routes
    const isProtectedRoute = Array.from(PROTECTED_ROUTES).some(route => 
      path.startsWith(route)
    )

    if (isProtectedRoute) {
      if (!session) {
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('returnTo', path)
        return NextResponse.redirect(loginUrl)
      }

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