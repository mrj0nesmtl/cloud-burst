import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ErrorBoundary } from '@/components/error-boundary'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Use a simpler approach - directly create the CSS in a public directory file
const cssPath = '/css/hide-header.css'

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication for all environments
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Use getUser instead of getSession for better security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Authentication error:', userError)
      redirect('/auth/signin?error=session_error')
    }
    
    if (!user) {
      console.log('No authenticated user, redirecting to sign in')
      redirect('/auth/signin?returnTo=/protected/dashboard')
    }
    
    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Profile fetch error:', profileError)
      redirect('/auth/signin?error=profile_error')
    }
    
    if (!profile) {
      console.error('Profile not found for user:', user.id)
      redirect('/auth/signin?error=profile_not_found')
    }
    
    console.log('User authenticated:', profile.email, 'Role:', profile.role)
    
    return (
      <ErrorBoundary>
        <AuthGuard>
          <>
            {/* Add a stylesheet link to hide the header */}
            <link rel="stylesheet" href={cssPath} />
            <DashboardLayout>
              <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto my-12" />}>
                {children}
              </Suspense>
            </DashboardLayout>
          </>
        </AuthGuard>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Protected layout error:', error)
    redirect('/auth/signin?error=unknown')
  }
}
