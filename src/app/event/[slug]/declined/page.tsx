import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { X, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'RSVP Declined',
  description: 'Thank you for your response',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper function to extract invitation token from referer, cookies, or URL params
async function getInvitationToken(searchParams?: { [key: string]: string | string[] | undefined }): Promise<string | null> {
  try {
    let token: string | null = null;
    
    // First try to get token from searchParams
    if (searchParams && searchParams.token) {
      token = searchParams.token as string;
      return token;
    }
    
    // Then try to get token from referer URL
    const requestHeaders = headers();
    const referer = requestHeaders.get('referer') || '';
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        token = refererUrl.searchParams.get('token');
      } catch (error) {
        console.error(`Error parsing referer URL: ${error}`);
      }
    }
    
    // If no token in referer, try cookies
    if (!token) {
      token = cookies().get('invitation_token')?.value || null;
    }
    
    return token;
  } catch (error) {
    console.error(`Error getting invitation token: ${error}`);
    return null;
  }
}

export default async function DeclinedPage({ 
  params,
  searchParams
}: { 
  params: { slug: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Create Supabase client
  const supabase = createClient();
  
  try {
    // First check if the slug is a UUID (direct event ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.slug);
    let eventQuery = supabase.from('events').select('*');
    
    // Query by ID or slug depending on the format
    if (isUUID) {
      eventQuery = eventQuery.eq('id', params.slug);
    } else {
      eventQuery = eventQuery.eq('slug', params.slug);
    }
    
    const { data: event, error: eventError } = await eventQuery.single();
      
    if (eventError || !event) {
      redirect('/error?message=Event+not+found');
    }
    
    // Get the invitation token and update the RSVP status if needed
    const token = await getInvitationToken(searchParams);
    
    if (token) {
      // Update invitation to declined if it exists
      await supabase
        .from('invitations')
        .update({ 
          rsvp_status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('token', token);
    }
    
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
                <Link href={`/event/${event.slug || event.id}`}>
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
    );
  } catch (error) {
    console.error(`Error in declined page: ${error}`);
    redirect(`/error?message=An+unexpected+error+occurred`);
  }
} 