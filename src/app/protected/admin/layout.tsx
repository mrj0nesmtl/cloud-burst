import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    redirect('/protected/dashboard')
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-8">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>

          {/* Main Content */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
              {children}
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
    </ErrorBoundary>
  )
} 