import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ErrorBoundary } from '@/components/error-boundary'
import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Server-side auth check - await the client creation
    const supabase = await createServerClient()
    
    // Get and validate session
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      const returnUrl = new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL)
      returnUrl.searchParams.set('returnTo', '/protected/dashboard')
      redirect(returnUrl.toString())
    }

    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw profileError
    }

    return (
      <ErrorBoundary>
        <AuthGuard>
          <DashboardLayout>
            {/* Main Content */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner className="flex-1" />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </DashboardLayout>
        </AuthGuard>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Protected layout error:', error)
    redirect('/auth/signin')
  }
}
