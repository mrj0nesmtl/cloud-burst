import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/config'

export default async function AdminDashboard() {
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      {/* Dashboard content */}
    </div>
  )
} 