'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Camera, Upload, Image as ImageIcon, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { PhotoUploader } from '@/components/guest/PhotoUploader'
import { BottomNav } from '@/components/guest/bottom-nav'

export default function GuestUploadPage() {
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize with token from URL or localStorage
  useEffect(() => {
    const token = urlToken || invitationTokenService.getToken()
    setInvitationToken(token)
    
    if (urlToken) {
      invitationTokenService.storeToken(urlToken)
    }
    
    if (!token) {
      setError('Invitation token not found')
      setLoading(false)
    } else {
      fetchEventDetails(token)
    }
  }, [urlToken])
  
  // Fetch event details using the invitation token
  const fetchEventDetails = async (token: string) => {
    try {
      setLoading(true)
      
      // Get the invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, event_id')
        .eq('token', token)
        .single()
        
      if (invitationError || !invitation) {
        console.error('Error fetching invitation:', invitationError)
        setError('Invalid invitation token')
        setLoading(false)
        return
      }
      
      setEventId(invitation.event_id)
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading event details:', err)
      setError(err.message || 'Failed to load event details')
      setLoading(false)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container py-10 space-y-8">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/guest/dashboard?token=' + invitationToken)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Upload Photos</h1>
      
      <Card className="p-6 mb-6">
        <Alert variant="default" className="mb-6 bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Choose photos from your device to share with the event. You can upload multiple photos at once.
          </AlertDescription>
        </Alert>
        
        {eventId && invitationToken && (
          <PhotoUploader 
            eventId={eventId} 
            invitationToken={invitationToken}
            maxFiles={10}
          />
        )}
      </Card>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={() => router.push(`/guest/camera?token=${invitationToken}`)}>
          <Camera className="mr-2 h-4 w-4" />
          Use Camera Instead
        </Button>
      </div>
      
      {/* Use the shared BottomNav component instead of inline navigation */}
      <BottomNav activeTab="upload" invitationToken={invitationToken} />
    </div>
  )
} 