import { Metadata } from 'next'
import { Camera, Check, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import CameraTest from '@/components/media/camera-test'

export const metadata: Metadata = {
  title: 'Camera Setup',
  description: 'Set up camera access for your event',
}

export default function CameraSetupPage({
  searchParams,
}: {
  searchParams: { event?: string }
}) {
  const eventSlug = searchParams.event || '';
  
  return (
    <div className="container max-w-lg py-10">
      <Card className="border-0">
        <CardHeader className="pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Camera className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Camera Setup
          </CardTitle>
          <CardDescription className="text-center pt-2">
            Let's set up camera access for your event
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Alert variant="outline" className="bg-blue-50 border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Why we need camera access</AlertTitle>
            <AlertDescription>
              Camera access lets you participate fully in the event by taking photos, joining virtual experiences, and connecting with other guests.
            </AlertDescription>
          </Alert>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Test your camera</h3>
            <p className="text-sm mb-4">
              Your browser will ask for permission to access your camera. Please click "Allow" when prompted.
            </p>
            
            <CameraTest />
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Good lighting</h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure you're in a well-lit area so the camera can capture clear images.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Camera positioning</h4>
                  <p className="text-sm text-muted-foreground">
                    Position your camera at eye level for the best angle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 p-6 pt-0">
          <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
            <Link href={eventSlug ? `/event/${eventSlug}` : "/guest/dashboard"}>
              Continue to Event
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We value your privacy. Your camera is only accessed when you explicitly choose to use it.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 