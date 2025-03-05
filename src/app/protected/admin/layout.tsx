import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Skip auth check in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return (
      <ErrorBoundary>
        <div className="w-full">
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
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 p-2 text-xs">
            <pre className="overflow-x-auto">
              {JSON.stringify({ profile: { role: 'super_admin' } }, null, 2)}
            </pre>
          </div>
        </div>
      </ErrorBoundary>
    )
  }
  
  try {
    // Server-side auth check - await the client creation
    const supabase = await createServerClient()
    
    // Get and validate session
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) {
      redirect('/auth/signin')
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw profileError
    }

    if (profile?.role !== 'super_admin') {
      redirect('/protected/dashboard')
    }

    return (
      <ErrorBoundary>
        <div className="w-full">
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
          {isDevelopment && (
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 p-2 text-xs">
              <pre className="overflow-x-auto">
                {JSON.stringify({ profile }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Admin layout error:', error)
    redirect('/protected/dashboard')
  }
} 