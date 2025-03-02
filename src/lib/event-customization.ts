import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// Remove the server component imports that use cookies from next/headers
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

export type EventCustomizationSettings = {
  id: string
  user_id: string
  event_id: string | null
  event_name: string | null
  event_description: string | null
  event_logo: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  enable_social_sharing: boolean
  auto_post_to_facebook: boolean
  auto_post_to_instagram: boolean
  auto_post_to_twitter: boolean
  social_sharing_message: string | null
  enable_live_chat: boolean
  moderate_chat: boolean
  allow_guest_chat: boolean
  chat_welcome_message: string | null
  gallery_layout: 'grid' | 'masonry' | 'slideshow'
  thumbnail_size: 'small' | 'medium' | 'large'
  photo_display_duration: number
  show_photo_info: boolean
  created_at: string
  updated_at: string
}

// Move the server component function to a separate file
// We'll create a new file called event-customization-server.ts for this
// export async function getEventCustomizationSettings(userId: string, eventId?: string) {
//   const supabase = createServerComponentClient({ cookies })
//   
//   const { data, error } = await supabase
//     .rpc('get_or_create_event_customization', {
//       p_user_id: userId,
//       p_event_id: eventId || null
//     })
//     .single()
//   
//   if (error) {
//     console.error('Error fetching event customization settings:', error)
//     throw error
//   }
//   
//   return data as EventCustomizationSettings
// }

// This function is used by client components and can stay here
export async function updateEventCustomizationSettings(
  settings: Partial<EventCustomizationSettings>,
  eventId?: string
) {
  const supabase = createClientComponentClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  
  // First, get the current settings
  const { data: currentSettings, error: fetchError } = await supabase
    .from('event_customization')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId || null)
    .single()
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching current event customization settings:', fetchError)
    throw fetchError
  }
  
  // Prepare the update data
  const updateData = {
    event_name: settings.event_name,
    event_description: settings.event_description,
    event_logo: settings.event_logo,
    primary_color: settings.primary_color,
    secondary_color: settings.secondary_color,
    accent_color: settings.accent_color,
    enable_social_sharing: settings.enable_social_sharing,
    auto_post_to_facebook: settings.auto_post_to_facebook,
    auto_post_to_instagram: settings.auto_post_to_instagram,
    auto_post_to_twitter: settings.auto_post_to_twitter,
    social_sharing_message: settings.social_sharing_message,
    enable_live_chat: settings.enable_live_chat,
    moderate_chat: settings.moderate_chat,
    allow_guest_chat: settings.allow_guest_chat,
    chat_welcome_message: settings.chat_welcome_message,
    gallery_layout: settings.gallery_layout,
    thumbnail_size: settings.thumbnail_size,
    photo_display_duration: settings.photo_display_duration,
    show_photo_info: settings.show_photo_info,
  }
  
  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key]
    }
  })
  
  // If settings exist, update them; otherwise, insert new settings
  if (currentSettings) {
    const { error } = await supabase
      .from('event_customization')
      .update(updateData)
      .eq('user_id', userId)
      .eq('event_id', eventId || null)
    
    if (error) {
      console.error('Error updating event customization settings:', error)
      throw error
    }
  } else {
    const { error } = await supabase
      .from('event_customization')
      .insert({
        user_id: userId,
        event_id: eventId || null,
        ...updateData
      })
    
    if (error) {
      console.error('Error inserting event customization settings:', error)
      throw error
    }
  }
  
  return true
}
