'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import { differenceInDays } from 'date-fns'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function SubscriptionForm() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(profile)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load subscription information'
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, toast])

  if (loading) {
    return <div>Loading subscription information...</div>
  }

  if (!profile) {
    return <div>No subscription information available</div>
  }

  const isTrialActive = profile.subscription_status === 'trial' && 
    new Date(profile.trial_expires_at) > new Date()
  
  const daysLeftInTrial = isTrialActive ? 
    differenceInDays(new Date(profile.trial_expires_at), new Date()) : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Basic Plan - Beta Access</CardTitle>
              <CardDescription>Full access during beta period</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isTrialActive ? (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Trial Period Active</span>
              </div>
              <p className="text-sm text-blue-600">
                You have {daysLeftInTrial} days left in your trial period.
              </p>
            </div>
          ) : null}
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Up to 5 events per month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Up to 500 photos per event</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced AI enhancement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Basic analytics</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            During the beta period, all Basic Plan features are available at no cost for 30 days.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Additional plans and features will be available after the beta period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're working on exciting new features and plan options. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 