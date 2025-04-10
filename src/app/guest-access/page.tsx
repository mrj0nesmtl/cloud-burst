'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Clock, User, Lock, Camera, Upload, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// This is a temporary bypass page for testing camera and photo upload functionality
// without requiring the invitation token validation

export default function GuestAccessBypass() {
  const [showCamera, setShowCamera] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  
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
  }
  
  const handleUploadClick = () => {
    setShowCamera(false)
    setShowPhotoUpload(true)
  }
  
  const handleBackClick = () => {
    setShowCamera(false)
    setShowPhotoUpload(false)
  }
  
  return (
    <div className="container max-w-3xl py-10">
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Test Mode</AlertTitle>
        <AlertDescription>
          This is a temporary access page for testing guest features without requiring invitation token validation.
        </AlertDescription>
      </Alert>
      
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Guest Access Test Mode</CardTitle>
          <CardDescription className="text-lg">
            {mockEvent.name}
          </CardDescription>
          <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{formatDate(mockEvent.start_date)}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          {mockEvent.description && (
            <div className="mb-6 rounded-lg bg-secondary p-4 text-secondary-foreground">
              <p>{mockEvent.description}</p>
            </div>
          )}
          
          {!showCamera && !showPhotoUpload ? (
            <div className="flex flex-col gap-4">
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
            This is a temporary solution while we fix the invitation system.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 