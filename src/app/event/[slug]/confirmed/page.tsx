import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Calendar, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'RSVP Confirmed',
  description: 'Thank you for confirming your attendance',
}

export default function ConfirmedPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container max-w-lg py-10">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Your RSVP has been confirmed!
          </CardTitle>
          <CardDescription className="text-center pt-2 text-base">
            Thank you for confirming your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="mb-4">
              We're excited to see you at the event. We've sent a confirmation email with all the details.
            </p>
            <p className="text-sm text-muted-foreground">
              If you need to make changes to your RSVP, please contact the event host.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/event/${params.slug}`}>
                <Calendar className="mr-2 h-4 w-4" />
                View Event Details
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/event/${params.slug}/share`}>
                <Share className="mr-2 h-4 w-4" />
                Share With Friends
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 