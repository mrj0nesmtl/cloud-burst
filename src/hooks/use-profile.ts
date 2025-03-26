import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile(userId: string | undefined) {
  const supabase = createClientComponentClient<Database>()

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided to useProfile')
        return null
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, updated_at, avatar_url')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return null
        }
        
        return data
      } catch (error) {
        console.error('Profile fetch error:', error)
        return null
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  
  return {
    profile: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  }
} 