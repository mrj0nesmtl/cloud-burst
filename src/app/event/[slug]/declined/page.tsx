import { Metadata } from 'next'
import Link from 'next/link'
import { X, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'RSVP Declined',
  description: 'Thank you for your response',
}

export default function DeclinedPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container max-w-lg py-10">
      <Card className="border-2 border-muted">
        <CardHeader className="bg-muted/10 pb-4">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-gray-100 p-3">
              <X className="h-10 w-10 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Your response has been recorded
          </CardTitle>
          <CardDescription className="text-center pt-2 text-base">
            We're sorry you won't be able to attend
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="mb-4">
              Thank you for letting us know. We've sent a confirmation email with your response.
            </p>
            <p className="text-sm text-muted-foreground">
              If your plans change and you'd like to attend, please contact the event host.
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
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 