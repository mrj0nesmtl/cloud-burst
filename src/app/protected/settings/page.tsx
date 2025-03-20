import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProfileForm } from '@/components/forms/profile-form'
import { PreferencesForm } from '@/components/forms/preferences-form'
import { NotificationsForm } from '@/components/forms/notifications-form'
import { SecurityForm } from '@/components/forms/security-form'
import { SubscriptionForm } from '@/components/forms/subscription-form'
import { SystemStatusDisplay } from '@/components/settings/system-status'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = {
  title: 'Settings | Cloud Burst',
  description: 'Manage your account settings and preferences',
}

type PreferencesFormValues = {
  autoPlay: boolean
  theme: "system" | "light" | "dark"
  emailDigest: boolean
  autoUpload: boolean
  highQualityPreviews: boolean
  language: "fr" | "en" | "es" | "de"
  displayDensity: "comfortable" | "compact" | "spacious"
  sortOrder: "size" | "name" | "newest" | "oldest"
}

type NotificationsFormValues = {
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  newEventAlerts: boolean
  photoComments: boolean
  photoLikes: boolean
  digestFrequency: "never" | "daily" | "weekly" | "monthly"
  notificationSound: boolean
}

async function updatePreferences(values: PreferencesFormValues): Promise<void> {
  'use server'
  
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: session.user.id,
      ...values,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/protected/settings')
}

async function updateNotifications(values: NotificationsFormValues): Promise<void> {
  'use server'
  
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  const { error } = await supabase
    .from('user_notifications')
    .upsert({
      user_id: session.user.id,
      ...values,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/protected/settings')
}

export default async function SettingsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
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
              <PreferencesForm onSubmit={updatePreferences} />
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
              <NotificationsForm onSubmit={updateNotifications} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SecurityForm />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                View system health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatusDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
