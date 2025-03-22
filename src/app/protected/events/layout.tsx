import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const metadata: Metadata = {
  title: 'Events | Cloud Burst',
  description: 'Manage your photography events',
}

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication and authorization
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    // Redirect to login if no user
    redirect('/auth/signin')
  }
  
  // Get the user's profile to check their role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Error fetching user profile:', profileError)
  }
  
  // Check if the user has the required role to access events
  const userRole = profile?.role || 'guest'
  const allowedRoles = ['super_admin', 'admin', 'organizer', 'event_host']
  
  if (!allowedRoles.includes(userRole)) {
    // Redirect to dashboard if user doesn't have permission
    redirect('/protected/dashboard')
  }
  
  return (
    <div className="w-full">
      {children}
    </div>
  )
} 