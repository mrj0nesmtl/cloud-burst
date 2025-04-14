import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EventDetails from '@/components/events/event-details';
import { Event } from '@/types/events';

export default async function EventPage({ params }: { params: { eventId: string } }) {
  const supabase = await getServerSupabase();
  
  // Fetch event by ID 
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single();
  
  if (!event) {
    // If not found by ID, try to find by slug
    const { data: eventBySlug } = await supabase
      .from('events')
      .select('*')
      .eq('slug', params.eventId)
      .single();
      
    if (!eventBySlug) {
      notFound();
    }
    
    return <EventDetails event={eventBySlug as unknown as Event} />;
  }
  
  // If the event has a custom_url, redirect to the custom URL page
  if (event.custom_url) {
    redirect(`/e/${event.custom_url}`);
  }
  
  // Otherwise, render the event details
  return <EventDetails event={event as unknown as Event} />;
} 