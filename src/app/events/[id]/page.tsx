import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import EventDetails from '@/components/events/event-details';

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  
  // Fetch event by ID
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!event) {
    notFound();
  }
  
  // If the event has a custom_url, redirect to the custom URL page
  if (event.custom_url) {
    redirect(`/e/${event.custom_url}`);
  }
  
  // Otherwise, render the event details
  return <EventDetails event={event} />;
} 