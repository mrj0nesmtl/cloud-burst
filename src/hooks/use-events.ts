import { useQuery } from '@/lib/query-helpers';
import { createClient } from '@/lib/supabase/client';

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  host_name?: string;
  host_email?: string;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    }
  });
} 