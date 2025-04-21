import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cloud Burst',
  description: 'Manage users, settings, and analytics for your Cloud Burst platform.',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Session error:', sessionError.message)
    redirect('/auth/signin')
  }

  if (!session) {
    redirect('/auth/signin')
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    redirect('/protected/gallery')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your platform settings and monitor user activity
            </p>
          </div>
          
          <AdminTabs />
          
          <ErrorBoundary>
            <div className="mt-4">
              {children}
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
} 