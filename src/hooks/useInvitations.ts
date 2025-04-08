import { useQuery } from '@/lib/query-helpers';
import { createClient } from '@/lib/supabase/client';
import { Invitation } from '@/types/invitations';
import { Database } from '@/types/supabase';

/**
 * Hook to fetch invitations for a specific event
 * @param eventId The ID of the event to fetch invitations for
 * @returns Query object with invitations data and loading state
 */
export function useInvitations(eventId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['invitations', eventId],
    queryFn: async () => {
      try {
        // Use type assertion to bypass typing issues
        const query = supabase
          .from('invitations')
          .select('*');
          
        // Using type assertion to bypass strict typing
        const { data, error } = await (query as any)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Force casting to Invitation array
        const invitations = (data || []) as unknown as Invitation[];
        return invitations;
      } catch (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true
  });
} 