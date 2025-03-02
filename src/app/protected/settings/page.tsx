import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProfileForm } from '@/components/forms/profile-form'
import { PreferencesForm } from '@/components/forms/preferences-form'
import { NotificationsForm } from '@/components/forms/notifications-form'
import { SecurityForm } from '@/components/forms/security-form'
import { EventCustomizationForm } from '@/components/forms/event-customization-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { redirect } from 'next/navigation'
import { getSecuritySettings } from '@/lib/security-settings'
import { getEventCustomizationSettings } from '@/lib/event-customization-server'

export const metadata: Metadata = {
  title: 'Settings | Cloud Burst',
  description: 'Manage your account settings and preferences',
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is an event host
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', session.user.id)

  const isEventHost = userRoles?.some(role => role.role_id === 2) || false

  return (
    <div className="container max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {isEventHost && <TabsTrigger value="event-customization">Event Customization</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile && <ProfileForm profile={profile} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience and interface settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm 
                initialValues={{
                  theme: 'system',
                  emailDigest: true,
                  autoUpload: false,
                  highQualityPreviews: true,
                  language: 'en',
                  displayDensity: 'comfortable',
                  dateFormat: 'MM/DD/YYYY',
                  timeFormat: '12h',
                  defaultView: 'grid',
                }}
                onSubmit={async (values) => {
                  // Handle preferences update
                  console.log(values)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsForm 
                initialValues={{
                  emailNotifications: true,
                  pushNotifications: true,
                  marketingEmails: false,
                  newEventAlerts: true,
                  photoComments: true,
                  photoLikes: true,
                  digestFrequency: 'weekly',
                  notificationSound: true,
                }}
                onSubmit={async (values) => {
                  // Handle notifications update
                  console.log(values)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SecurityForm 
            initialValues={{
              enableTwoFactor: false,
              autoLockSession: true,
              sessionTimeout: '4h',
              loginNotifications: true,
            }}
            onSecuritySettingsSubmit={async (values) => {
              // Handle security settings update
              console.log(values)
              
              // In a real implementation, we would update the user's security settings in the database
              // await supabase.from('user_security_settings').upsert({
              //   user_id: session.user.id,
              //   ...values,
              //   updated_at: new Date().toISOString(),
              // })
            }}
          />
        </TabsContent>
        
        {isEventHost && (
          <TabsContent value="event-customization" className="space-y-6">
            <EventCustomizationForm 
              onSubmit={async (values) => {
                // Handle event customization update
                console.log(values)
                
                // In a real implementation, we would update the event customization settings in the database
                // await supabase.from('event_customization').upsert({
                //   user_id: session.user.id,
                //   ...values,
                //   updated_at: new Date().toISOString(),
                // })
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
