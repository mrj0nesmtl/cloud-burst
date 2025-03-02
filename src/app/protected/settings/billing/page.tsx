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
import { Button } from '@/components/ui/button'
import { CreditCard, DollarSign, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Billings | Cloud Burst',
  description: 'Manage subscription plans and billing information',
}

export default async function BillingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch subscription stats
  const { data: subscriptionStats, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
  
  if (error) {
    console.error('Error fetching subscription stats:', error)
  }

  // Calculate subscription metrics
  const totalUsers = subscriptionStats?.length || 0
  const activeSubscriptions = subscriptionStats?.filter(
    profile => profile.subscription_status === 'active'
  ).length || 0
  
  const subscriptionTiers = subscriptionStats?.reduce((acc, profile) => {
    const tier = profile.subscription_tier || 'free'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billings Management</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((activeSubscriptions / totalUsers) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionTiers.pro || 0} pro users
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Manage subscription plans and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                <div>Plan</div>
                <div>Price</div>
                <div>Users</div>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">Free</span>
                    <span className="text-sm text-muted-foreground">Basic features</span>
                  </div>
                  <div className="flex items-center">$0.00</div>
                  <div className="flex items-center">{subscriptionTiers.free || 0}</div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">Basic</span>
                    <span className="text-sm text-muted-foreground">Standard features</span>
                  </div>
                  <div className="flex items-center">$9.99/month</div>
                  <div className="flex items-center">{subscriptionTiers.basic || 0}</div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">Pro</span>
                    <span className="text-sm text-muted-foreground">Advanced features</span>
                  </div>
                  <div className="flex items-center">$29.99/month</div>
                  <div className="flex items-center">{subscriptionTiers.pro || 0}</div>
                  <div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
