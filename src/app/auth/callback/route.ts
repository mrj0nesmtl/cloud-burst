import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=no_code`
      )
    }

    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      `${new URL(request.url).origin}/auth/login?error=auth_callback_failed`
    )
  }
} 