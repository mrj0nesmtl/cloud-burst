import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ErrorBoundary } from '@/components/error-boundary'
import { AdminSidebar } from './components/AdminSidebar'

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

  // Check if user has admin or super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
} 