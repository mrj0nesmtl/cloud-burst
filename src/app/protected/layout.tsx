import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MainNav } from '@/components/nav/main-nav'
import { UserNav } from '@/components/nav/user-nav'
import { SideNav } from '@/components/nav/side-nav'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ErrorBoundary } from '@/components/error-boundary'
import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const returnUrl = new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL)
    returnUrl.searchParams.set('returnTo', '/protected/dashboard')
    redirect(returnUrl.toString())
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <MainNav />
              <UserNav user={session.user} profile={profile} />
            </div>
          </header>

          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            {/* Sidebar Navigation */}
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
              <SideNav user={session.user} profile={profile} />
            </aside>

            {/* Main Content */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner className="flex-1" />}>
                <main className="flex w-full flex-col overflow-hidden">
                  {children}
                </main>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Debug Panel - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 p-2 text-xs">
              <pre className="overflow-x-auto">
                {JSON.stringify({ profile }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AuthGuard>
    </ErrorBoundary>
  )
}
