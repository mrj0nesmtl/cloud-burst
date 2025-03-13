import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/forms/profile-form'
import { AvatarUpload } from '@/components/forms/avatar-upload'
import { SecurityForm } from '@/components/forms/security-form'
import { PreferencesForm } from '@/components/forms/preferences-form'
import { NotificationsForm } from '@/components/forms/notifications-form'
import { EventCustomizationForm } from '@/components/forms/event-customization-form'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Profile | Cloud Burst',
  description: 'Manage your profile and account settings',
}

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
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
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Profile</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Manage your profile, preferences, and account settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="md:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Profile Overview</CardTitle>
            <CardDescription>
              Your personal information and profile settings
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center space-y-4">
              {profile && (
                <AvatarUpload
                  userId={profile.id}
                  currentAvatarUrl={profile.avatar_url}
                  onUpload={async (url) => {
                    // This will be handled by the component
                  }}
                />
              )}
              <div className="text-center">
                <h3 className="font-medium text-lg">{profile?.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">@{profile?.username || 'username'}</p>
              </div>
            </div>
            
            <div className="md:col-span-2">
              {profile && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                      <p>{session.user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Username</h4>
                      <p>{profile.username || 'Not set'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                      <p>{profile.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Account Type</h4>
                      <p>{isEventHost ? 'Event Host' : 'Standard User'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
