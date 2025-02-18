import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Cloud Burst',
  description: 'Manage your account settings',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          {/* Profile settings form will go here */}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preferences</h2>
          {/* Preferences form will go here */}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          {/* Notification settings will go here */}
        </div>
      </div>
    </div>
  )
}
