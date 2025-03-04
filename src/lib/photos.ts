import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type Photo = {
  id: string
  event_id: string
  user_id: string
  filename: string
  storage_path: string
  thumbnail_path: string | null
  metadata: {
    width?: number
    height?: number
    size?: number
    format?: string
    taken_at?: string
  }
  status: 'processing' | 'active' | 'archived' | 'deleted'
  created_at: string
  updated_at: string
}

export async function getEventPhotos(eventId: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching event photos:', error)
    throw error
  }
  
  return data as Photo[]
}

export async function uploadPhoto(eventId: string, file: File) {
  const supabase = createClientComponentClient()
  
  // Get the current user
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  
  // Generate a unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `events/${eventId}/${fileName}`
  
  // Upload the file to storage
  const { error: uploadError } = await supabase
    .storage
    .from('photos')
    .upload(filePath, file)
  
  if (uploadError) {
    console.error('Error uploading photo:', uploadError)
    throw uploadError
  }
  
  // Create a record in the photos table
  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      event_id: eventId,
      user_id: userId,
      filename: fileName,
      storage_path: filePath,
      metadata: {
        size: file.size,
        format: fileExt
      },
      status: 'processing'
    })
    .select()
    .single()
  
  if (insertError) {
    console.error('Error creating photo record:', insertError)
    throw insertError
  }
  
  return data as Photo
}

export async function deletePhoto(photoId: string) {
  const supabase = createClientComponentClient()
  
  // Get the photo details first
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .single()
  
  if (fetchError) {
    console.error('Error fetching photo:', fetchError)
    throw fetchError
  }
  
  // Mark the photo as deleted in the database
  const { error: updateError } = await supabase
    .from('photos')
    .update({ status: 'deleted' })
    .eq('id', photoId)
  
  if (updateError) {
    console.error('Error marking photo as deleted:', updateError)
    throw updateError
  }
  
  return true
} 