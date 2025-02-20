import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-config'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MainNav } from '@/components/nav/main-nav'
import { UserNav } from '@/components/nav/user-nav'
import { AuthDebug } from '@/components/auth/auth-debug'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    // Add return URL for post-login redirect
    const returnUrl = new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL)
    returnUrl.searchParams.set('returnTo', '/protected/dashboard')
    redirect(returnUrl.toString())
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <UserNav user={session.user} />
        </div>
      </header>

      {/* Main Content */}
      <Suspense fallback={<LoadingSpinner className="flex-1" />}>
        <main className="container flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </Suspense>

      {/* Debug Panel - only in development */}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </div>
  )
}
