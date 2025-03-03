import { createClient } from './client';
import { SearchResults } from '@/types/search';

export async function searchEvents(query: string): Promise<SearchResults> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('search_events', {
      search_query: query
    });
    
  if (error) {
    console.error('Error searching events:', error);
    throw new Error(`Failed to search events: ${error.message}`);
  }
  
  return data as SearchResults;
}
