import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/auth-store'
import { toast } from '@/components/ui/use-toast'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { user } = useAuthStore()
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<typeof user>) => {
      if (!user?.id) {
        throw new Error('User ID is required')
      }
      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()
        
      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }
      
      return updatedProfile
    },
    onSuccess: (data) => {
      // Update the auth store with the new profile data
      useAuthStore.getState().setUser(data)
      
      // Invalidate the profile query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      })
    },
    onError: (error) => {
      console.error('Profile update error:', error)
      toast({
        title: 'Profile update failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    }
  })
  
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User ID is required')
      }
      
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`
      
      // Upload the file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file)
        
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        throw uploadError
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      // Update the profile with the new avatar URL
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single()
        
      if (updateError) {
        console.error('Error updating profile with avatar:', updateError)
        throw updateError
      }
      
      return updatedProfile
    },
    onSuccess: (data) => {
      // Update the auth store with the new profile data
      useAuthStore.getState().setUser(data)
      
      // Invalidate the profile query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been updated successfully',
      })
    },
    onError: (error) => {
      console.error('Avatar update error:', error)
      toast({
        title: 'Avatar update failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    }
  })
  
  return {
    updateProfile: updateProfileMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isUploading: uploadAvatarMutation.isPending,
    error: updateProfileMutation.error || uploadAvatarMutation.error
  }
} 