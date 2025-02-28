import { describe, it, expect, vi } from 'vitest'
import { middleware } from './middleware'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } })
    }
  })
}))

describe('Middleware', () => {
  it('should redirect unauthenticated users from protected routes', async () => {
    const req = new NextRequest(new URL('http://localhost/protected/dashboard'))
    const res = await middleware(req)

    expect(res instanceof NextResponse).toBe(true)
    expect(res.status).toBe(307) // Redirect status
    expect(res.headers.get('location')).toContain('/auth/signin')
  })

  it('should allow access to public routes', async () => {
    const req = new NextRequest(new URL('http://localhost/'))
    const res = await middleware(req)

    expect(res instanceof NextResponse).toBe(true)
    expect(res.status).toBe(200)
  })
}) 