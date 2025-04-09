import { Metadata } from 'next'
import { getServerSupabase } from '@/lib/supabase/server'
import { StaffManagement } from '@/components/admin/staff-management'
import { UserCheck, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound, redirect } from 'next/navigation'

interface StaffPageProps {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'Staff Management | Cloud Burst',
  description: 'Manage staff and contractors for your event'
}

export default async function StaffPage({ params }: StaffPageProps) {
  const supabase = await getServerSupabase()
  const { data: session } = await supabase.auth.getSession()
  
  if (!session?.session) {
    redirect('/login?redirect=' + encodeURIComponent(`/protected/events/${params.id}/staff`))
  }

  // Fetch event data to check permissions
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()
    
  if (!event) {
    notFound()
  }
  
  // First check if user is the event organizer
  const isOrganizer = event.organizer_id === session.session.user.id;
  
  // If not organizer, check for staff permissions
  let hasStaffManagementAccess = isOrganizer;
  
  if (!isOrganizer) {
    // Check if user has permission to access staff management
    const { data: permission } = await supabase
      .from('event_staff')
      .select('role')
      .eq('event_id', params.id)
      .eq('user_id', session.session.user.id)
      .single();
    
    // Also check admin status from profiles table
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.session.user.id)
      .maybeSingle();
    
    const isAdmin = !!userProfile?.role && (userProfile.role === 'admin' || userProfile.role === 'super_admin');
    
    hasStaffManagementAccess = isAdmin || 
      (!!permission && ['organizer', 'admin', 'super_admin', 'event_host'].includes(permission.role as string));
  }
  
  if (!hasStaffManagementAccess) {
    redirect('/protected/events');
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your event staff and contractors
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="staff">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">
            <UserCheck className="mr-2 h-4 w-4" />
            Internal Staff
          </TabsTrigger>
          <TabsTrigger value="contractors">
            <Users className="mr-2 h-4 w-4" />
            External Contractors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Internal Staff Management</CardTitle>
              <CardDescription>
                Manage employees who have access to this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagement eventId={params.id} staffType="internal" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contractors" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>External Contractors</CardTitle>
              <CardDescription>
                Manage photographers, tech support, marketing partners and other external contractors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagement eventId={params.id} staffType="external" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
