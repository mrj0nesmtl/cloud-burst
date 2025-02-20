import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client-config'
import type { Database } from '@/types/supabase'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      if (!userId) throw new Error('User ID is required')

      const { data, error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate profile query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
} 