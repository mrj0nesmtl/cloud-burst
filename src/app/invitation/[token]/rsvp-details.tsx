"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shell } from "@/components/shell";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, Clock, MapPin, XCircle } from "lucide-react";
import { RsvpStatus } from "@/types/invitations";
import { Database } from "@/types/supabase";

export function RsvpDetails() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient<Database>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [rsvpData, setRsvpData] = useState<any>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  
  const token = params.token as string;
  const status = searchParams.get('status') as RsvpStatus;
  
  useEffect(() => {
    async function fetchRsvpDetails() {
      try {
        setLoading(true);
        
        // Fetch invitation data using the token
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, name, email, event_id, status, rsvp_status, rsvp_date, metadata')
          .eq('token', token)
          .single();
        
        if (invitationError) {
          throw new Error('Unable to find your invitation. It may have expired or been removed.');
        }
        
        setInvitationData(invitation);
        
        // Fetch event data
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name, description, start_date, end_date, location, cover_image_url')
          .eq('id', invitation.event_id)
          .single();
        
        if (eventError) {
          throw new Error('Unable to find event details.');
        }
        
        setEventData(event);
        
        // Fetch RSVP details if available
        if (invitation.rsvp_status === 'accepted' || invitation.rsvp_status === 'declined') {
          const { data: rsvp, error: rsvpError } = await supabase
            .from('rsvps')
            .select('id, status, guest_count, dietary_restrictions, notes, created_at')
            .eq('invitation_id', invitation.id)
            .single();
          
          if (!rsvpError && rsvp) {
            setRsvpData(rsvp);
          }
        }
      } catch (err) {
        console.error('Error fetching RSVP details:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchRsvpDetails();
    }
  }, [token, supabase]);
  
  const getStatusIcon = () => {
    return status === 'accepted' || invitationData?.rsvp_status === 'accepted' ? (
      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
    ) : (
      <XCircle className="h-12 w-12 text-red-500 mb-4" />
    );
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  if (loading) {
    return (
      <Shell>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Loading RSVP Details</CardTitle>
            <CardDescription>Please wait while we load your RSVP information...</CardDescription>
          </CardHeader>
        </Card>
      </Shell>
    );
  }
  
  if (error) {
    return (
      <Shell>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </Shell>
    );
  }
  
  const currentStatus = status || invitationData?.rsvp_status;
  
  return (
    <Shell>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            <CardTitle className="text-2xl">
              {currentStatus === 'accepted' ? 'Thanks for accepting!' : 'Response received'}
            </CardTitle>
            <CardDescription className="mt-2">
              {currentStatus === 'accepted' 
                ? "We're looking forward to seeing you!"
                : "We're sorry you won't be able to join us."}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {eventData && (
            <>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{eventData.name}</h3>
                {eventData.description && (
                  <p className="text-sm text-muted-foreground">{eventData.description}</p>
                )}
              </div>
              
              {eventData.cover_image_url && (
                <div className="relative h-40 w-full rounded-md overflow-hidden">
                  <Image 
                    src={eventData.cover_image_url}
                    alt={eventData.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-3 pt-2">
                {eventData.start_date && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Date</Label>
                      <p className="text-sm text-muted-foreground">{formatDate(eventData.start_date)}</p>
                    </div>
                  </div>
                )}
                
                {eventData.start_date && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(eventData.start_date)}
                        {eventData.end_date && ` - ${formatTime(eventData.end_date)}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {eventData.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-muted-foreground">{eventData.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {currentStatus === 'accepted' && rsvpData && (
                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium">Your RSVP Details</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Label className="text-xs">Guest Count</Label>
                      <p className="text-muted-foreground">{rsvpData.guest_count}</p>
                    </div>
                    
                    {invitationData?.metadata?.plus_one_used && (
                      <div>
                        <Label className="text-xs">Plus One</Label>
                        <p className="text-muted-foreground">{invitationData.metadata.plus_one_name || 'Yes'}</p>
                      </div>
                    )}
                    
                    {rsvpData.dietary_restrictions && (
                      <div className="col-span-2">
                        <Label className="text-xs">Dietary Restrictions</Label>
                        <p className="text-muted-foreground">{rsvpData.dietary_restrictions}</p>
                      </div>
                    )}
                    
                    {rsvpData.notes && (
                      <div className="col-span-2">
                        <Label className="text-xs">Additional Notes</Label>
                        <p className="text-muted-foreground">{rsvpData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {currentStatus === 'accepted' ? (
            <Button
              variant="outline"
              onClick={() => router.push(`/invitation/${token}`)}
              className="w-full"
            >
              Update My RSVP
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/invitation/${token}`)}
              className="w-full"
            >
              Change My Response
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
} 