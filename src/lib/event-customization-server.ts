import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EventCustomizationSettings } from './event-customization'

export async function getEventCustomizationSettings(userId: string, eventId?: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .rpc('get_or_create_event_customization', {
      p_user_id: userId,
      p_event_id: eventId || null
    })
    .single()
  
  if (error) {
    console.error('Error fetching event customization settings:', error)
    throw error
  }
  
  return data as EventCustomizationSettings
} 