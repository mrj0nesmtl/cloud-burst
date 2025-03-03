import { createClient } from '@/lib/supabase/client';
import { useEventsStore } from '@/store/events-store';

export function setupRealtimeEventUpdates(eventId: string) {
  const supabase = createClient();
  const updateEvent = useEventsStore.getState().fetchEvent;
  
  const subscription = supabase
    .channel(`event-${eventId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'events',
      filter: `id=eq.${eventId}`
    }, (payload) => {
      updateEvent(eventId);
    })
    .subscribe();
    
  return () => {
    subscription.unsubscribe();
  };
}