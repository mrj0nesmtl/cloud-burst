import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define valid user roles
type UserRole = 'ADMIN' | 'EVENT_HOST' | 'USER' | 'GUEST'

// Define route patterns based on security standards
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/event/[code]'
] as const

const ROLE_PROTECTED_ROUTES: Record<UserRole, string[]> = {
  ADMIN: ['/admin'],
  EVENT_HOST: ['/events/manage'],
  USER: ['/dashboard', '/events', '/settings', '/profile'],
  GUEST: ['/event/[code]']
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  // Check if route is public
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return response
  }

  // No session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Get user role from session and ensure it's a valid role
  const userRole = (session.user.user_metadata.role || 'USER') as UserRole
  
  // Check if user has access to the route
  const hasAccess = ROLE_PROTECTED_ROUTES[userRole]?.some((route: string) => 
    path.startsWith(route)
  ) || false

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

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