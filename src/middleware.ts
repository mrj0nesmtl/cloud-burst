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
    
    // Always add security headers first
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    const path = request.nextUrl.pathname

    // Check if Supabase credentials are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase credentials missing - authentication disabled')
      // Still allow public routes
      return PUBLIC_ROUTES.has(path) ? res : NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Allow public routes and event viewing
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

      // Admin route protection
      if (path.startsWith('/admin') && session.user.user_metadata.role !== 'ADMIN') {
        console.warn(`Unauthorized admin access attempt by ${session.user.id}`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to signin but preserve the intended destination
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 