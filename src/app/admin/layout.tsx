import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/config'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        {/* Admin navigation */}
      </nav>
      <main>{children}</main>
    </div>
  )
} 