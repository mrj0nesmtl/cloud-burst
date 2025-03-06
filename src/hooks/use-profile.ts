import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile(userId: string | undefined) {
  const supabase = createClient()

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
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          throw error
        }
        
        console.log('Profile fetched successfully:', data?.email)
        return data as Profile
      } catch (error) {
        console.error('Profile fetch error:', error)
        throw error
      }
    },
    enabled: !!userId,
  })
  
  return {
    profile: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  }
} 