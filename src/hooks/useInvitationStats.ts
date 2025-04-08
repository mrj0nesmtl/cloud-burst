import { useQuery } from '@/lib/query-helpers';

// Define the stats interface
export interface InvitationStats {
  total: number;
  pending: number;
  opened: number;
  accepted: number;
  declined: number;
  sent: number;
  draft: number;
}

export interface ApiResponse {
  stats: InvitationStats;
  analytics: {
    averageResponseTime: number | null;
    responseSource: Record<string, number>;
  };
}

/**
 * Hook to fetch invitation statistics for an event
 * @param eventId - The ID of the event to fetch statistics for
 */
export function useInvitationStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ['invitationStats', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      
      const response = await fetch(`/api/rpc/get-invitation-stats?eventId=${eventId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch invitation stats: ${response.status}`);
      }
      
      const data = await response.json() as ApiResponse;
      return data.stats;
    },
    enabled: !!eventId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2
  });
} 