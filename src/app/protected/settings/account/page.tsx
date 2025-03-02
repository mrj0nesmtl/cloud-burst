import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: 'Accounts | Cloud Burst',
  description: 'Manage user accounts and subscriptions',
}

// Define types for our data
interface Profile {
  id: string;
  full_name: string | null;
  role: 'super_admin' | 'admin' | 'event_host' | 'user' | 'guest' | null;
  subscription_tier: 'free' | 'basic' | 'pro' | null;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due' | null;
  created_at: string;
  user_id: string;
}

interface User {
  id: string;
  email: string | null;
  created_at: string;
}

interface CombinedUser extends Profile {
  email: string;
  user_created_at: string | undefined;
}

export default async function AccountsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, subscription_tier, subscription_status, created_at, user_id')
    .order('created_at', { ascending: false })
  
  // Fetch users separately to avoid join issues
  let users: User[] = []
  if (profiles && profiles.length > 0) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, created_at')
    
    users = userData || []
  }
  
  // Combine the data
  const combinedData: CombinedUser[] = profiles?.map(profile => {
    const user = users.find(u => u.id === profile.user_id)
    return {
      ...profile,
      email: user?.email || 'N/A',
      user_created_at: user?.created_at
    }
  }) || []
  
  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            Manage user accounts and subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {combinedData.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                  <div>User</div>
                  <div>Role</div>
                  <div>Subscription</div>
                  <div>Status</div>
                  <div>Joined</div>
                </div>
                <div className="divide-y">
                  {combinedData.map((user) => (
                    <div key={user.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                        <span className="text-sm text-muted-foreground">{user.full_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="capitalize">{user.role || 'user'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="capitalize">{user.subscription_tier || 'free'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : user.subscription_status === 'past_due'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.subscription_status || 'inactive'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {user.user_created_at && (
                          <span>{new Date(user.user_created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="font-medium text-lg">No users found</h3>
              <p className="text-muted-foreground mt-1">There are no user accounts to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
