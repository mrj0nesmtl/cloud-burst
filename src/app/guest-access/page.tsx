'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Clock, User, Lock, Camera, Upload, AlertTriangle, Ticket } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// This is a temporary bypass page for testing camera and photo upload functionality
// without requiring the invitation token validation

export default function GuestAccessBypass() {
  const [showCamera, setShowCamera] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // Mock event data that would normally come from the invitation
  const mockEvent = {
    id: "test-event-123",
    name: "Test Event",
    description: "This is a test event for bypassing the invitation system",
    start_date: new Date().toISOString(),
    location: "Test Location"
  }
  
  // Simple date formatter
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const handleCameraClick = () => {
    setShowCamera(true)
    setShowPhotoUpload(false)
    setShowTokenInput(false)
  }
  
  const handleUploadClick = () => {
    setShowCamera(false)
    setShowPhotoUpload(true)
    setShowTokenInput(false)
  }
  
  const handleTokenClick = () => {
    setShowCamera(false)
    setShowPhotoUpload(false)
    setShowTokenInput(true)
  }
  
  const handleBackClick = () => {
    setShowCamera(false)
    setShowPhotoUpload(false)
    setShowTokenInput(false)
  }
  
  const handleSubmitToken = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please enter an invitation token')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Use client-side Supabase to check the token
      const supabase = createClientComponentClient()
      
      // Query the invitation directly
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('id, event_id, email, name, status, rsvp_status, expires_at')
        .eq('token', token)
        .single()
      
      if (error || !invitation) {
        console.error('Error finding invitation:', error)
        toast.error('Invalid invitation token')
        setIsLoading(false)
        return
      }
      
      // Check if invitation is valid
      const now = new Date()
      const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
      
      if (invitation.status === 'expired' || (expiresAt && now > expiresAt)) {
        toast.error('This invitation has expired')
        setIsLoading(false)
        return
      }
      
      // Navigate to the appropriate page based on RSVP status
      if (invitation.rsvp_status === 'ACCEPTED') {
        toast.success('Redirecting to confirmation page')
        router.push(`/invitation/${token}/confirmation/accepted`)
      } else if (invitation.rsvp_status === 'DECLINED') {
        toast.success('Redirecting to confirmation page')
        router.push(`/invitation/${token}/confirmation/declined`)
      } else {
        // If not yet responded, go to the RSVP form
        toast.success('Invitation found - redirecting to RSVP form')
        router.push(`/events/${invitation.event_id}?token=${token}`)
      }
    } catch (error) {
      console.error('Error validating token:', error)
      toast.error('Failed to validate invitation token')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Alternative Access</AlertTitle>
        <AlertDescription>
          If you're having trouble accessing your invitation from the email link, you can enter your invitation token here.
        </AlertDescription>
      </Alert>
      
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Guest Access</CardTitle>
          <CardDescription className="text-lg">
            Access your invitation or event photos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!showCamera && !showPhotoUpload && !showTokenInput ? (
            <div className="flex flex-col gap-4">
              <Button onClick={handleTokenClick} className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Enter Invitation Token
              </Button>
              
              <Button onClick={handleCameraClick} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Test Camera Access
              </Button>
              
              <Button onClick={handleUploadClick} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Test Photo Upload
              </Button>
              
              <Link href="/events">
                <Button variant="outline" className="w-full">View Available Events</Button>
              </Link>
            </div>
          ) : (
            <>
              <Button onClick={handleBackClick} variant="outline" className="mb-4">
                Back to Options
              </Button>
              
              {showTokenInput && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Enter Your Invitation Token</h3>
                  <form onSubmit={handleSubmitToken} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="token">Invitation Token</Label>
                      <Input
                        id="token"
                        placeholder="Enter your invitation token (e.g., 12345678-1234-1234-1234-123456789012)"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        The token can be found in your invitation email or URL
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Validating...' : 'Access Invitation'}
                    </Button>
                  </form>
                </div>
              )}
              
              {showCamera && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Camera Test</h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Camera access would appear here</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This would integrate with your camera component for testing photo capture.
                  </p>
                </div>
              )}
              
              {showPhotoUpload && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Photo Upload Test</h3>
                  <div 
                    className="border-2 border-dashed border-primary/50 rounded-md p-8 flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Drag photos here or click to browse</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This would integrate with your upload component for testing file uploads.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please contact the event organizer.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 