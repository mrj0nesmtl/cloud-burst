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
  description: 'Manage your profile settings',
}

// Redirect to the consolidated settings page
export default function ProfilePage() {
  redirect('/protected/settings');
}
