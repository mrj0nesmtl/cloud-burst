import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { createGalleryForEvent } from './galleries'
import { Database } from '@/types/supabase'
import { generateEventAccessCode } from '../utils/codeGenerator'
import { generateQRCodeUrl } from '@/lib/qr-code'
import { 
  CreateEventParams, 
  UpdateEventParams, 
  Event, 
  EventWithCounts,
  CreateAttendeeParams,
  UpdateAttendeeParams,
  EventAttendee,
  BulkImportAttendeesParams
} from '@/types/events'
import { generateRandomCode } from '@/lib/utils'

/**
 * Create a new event
 */
export async function createEvent(eventData: CreateEventParams) {
  const supabase = createClient()
  
  try {
    // Generate a unique ID for the event
    const eventId = uuidv4()
    
    // Generate a QR code URL for the event
    const qrCodeURL = generateQRCodeUrl({
      event_id: eventId,
      type: 'event'
    })
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'User not authenticated' } }
    }
    
    // Add the generated QR code URL and organizer ID to the event data
    const completeEventData = {
      ...eventData,
      id: eventId,
      organizer_id: user.id,
      status: eventData.status || 'draft', // Default to draft if not specified
      qr_code_url: qrCodeURL
    }
    
    // Insert the event into the database
    const { data: event, error: createError } = await supabase
      .from('events')
      .insert(completeEventData)
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating event:', createError)
      return { error: createError }
    }
    
    // Create a gallery for the event
    const galleryResult = await createGalleryForEvent(eventId)
    
    if (galleryResult.error) {
      console.error('Error creating gallery for event:', galleryResult.error)
      // We'll continue anyway since the event was created successfully
      // The gallery can be created later
    } else {
      console.log('Gallery created successfully for event', eventId)
    }
    
    return { data: event }
  } catch (error) {
    console.error('Error in createEvent:', error)
    return { error }
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(eventId: string, updates: UpdateEventParams) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating event:', error)
    return { error }
  }
  
  // If we're updating to published status and the event was a draft,
  // make sure the gallery is properly set up
  if (updates.status === 'published') {
    // Check if gallery exists
    const { data: existingGallery } = await supabase
      .from('galleries')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()
    
    // If gallery doesn't exist, create it
    if (!existingGallery) {
      const galleryResult = await createGalleryForEvent(eventId)
      if (galleryResult.error) {
        console.error('Error creating gallery during event publication:', galleryResult.error)
        // Continue anyway as the event is updated
      }
    }
  }
  
  return { data }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
  
  if (error) {
    console.error('Error deleting event:', error)
    return { error }
  }
  
  return { success: true }
}

/**
 * Get an event by ID
 */
export async function getEvent(eventId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  
  if (error) {
    console.error('Error fetching event:', error)
    return { error }
  }
  
  return { data }
}

/**
 * Get an event with attendee and photo counts
 */
export async function getEventWithCounts(eventId: string) {
  const supabase = createClient()
  
  // Get the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  
  if (eventError) {
    console.error('Error fetching event:', eventError)
    return { error: eventError }
  }
  
  // Get attendee count
  const { count: attendeeCount, error: attendeeError } = await supabase
    .from('event_attendees')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
  
  if (attendeeError) {
    console.error('Error fetching attendee count:', attendeeError)
    // Continue anyway
  }
  
  // Get photo count (via gallery)
  let photoCount = 0
  
  // First get the gallery for this event
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle()
  
  if (!galleryError && gallery) {
    // Then get the photo count
    const { count, error: photoError } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('gallery_id', gallery.id)
    
    if (!photoError) {
      photoCount = count || 0
    }
  }
  
  return { 
    data: {
      ...event,
      attendeeCount: attendeeCount || 0,
      photoCount
    } 
  }
}

/**
 * Get all events for the current user
 */
export async function getUserEvents() {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }
  
  // Get all events where the user is the organizer
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user events:', error)
    return { error }
  }
  
  return { data }
}

/**
 * Get all events for the current user with attendee counts
 */
export async function getUserEventsWithCounts() {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }
  
  // Get all events where the user is the organizer
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false })
  
  if (eventsError) {
    console.error('Error fetching user events:', eventsError)
    return { error: eventsError }
  }
  
  // Get all attendees for these events
  const eventIds = events.map(event => event.id)
  const { data: attendees, error: attendeesError } = await supabase
    .from('event_attendees')
    .select('event_id')
    .in('event_id', eventIds)
  
  if (attendeesError) {
    console.error('Error fetching event attendees:', attendeesError)
    // Continue anyway
  }
  
  // Count attendees per event
  const attendeeCountMap: Record<string, number> = {}
  if (attendees) {
    attendees.forEach(attendee => {
      if (attendee.event_id) {
        attendeeCountMap[attendee.event_id] = (attendeeCountMap[attendee.event_id] || 0) + 1
      }
    })
  }
  
  // Add attendee counts to events
  const eventsWithCounts = events.map(event => ({
    ...event,
    attendeeCount: attendeeCountMap[event.id] || 0
  }))
  
  return { data: eventsWithCounts }
}

/**
 * Get public events (published and upcoming)
 */
export async function getPublicEvents() {
  const supabase = createClient()
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'published')
    .gte('date', now)
    .order('date', { ascending: true })
  
  if (error) {
    console.error('Error fetching public events:', error)
    return { error }
  }
  
  return { data }
}

/**
 * Add an attendee to an event
 */
export async function addEventAttendee(eventId: string, attendeeData: any, code?: string) {
  const supabase = createClient()
  
  // Generate a unique code for this attendee if not provided
  const accessCode = code || generateEventAccessCode()
  
  const completeAttendeeData = {
    ...attendeeData,
    event_id: eventId,
    access_code: accessCode,
    created_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert(completeAttendeeData)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding event attendee:', error)
    return { error }
  }
  
  return { data }
}

/**
 * Update an event attendee
 */
export async function updateEventAttendee(id: string, params: UpdateAttendeeParams): Promise<EventAttendee> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .update(params)
    .eq('id', id)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating event attendee:', error)
    throw new Error(`Failed to update event attendee: ${error.message}`)
  }
  
  return data as EventAttendee
}

/**
 * Delete an event attendee
 */
export async function deleteEventAttendee(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('id', id)
    
  if (error) {
    console.error('Error deleting event attendee:', error)
    throw new Error(`Failed to delete event attendee: ${error.message}`)
  }
}

/**
 * Get all attendees for an event
 */
export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error('Error fetching event attendees:', error)
    throw new Error(`Failed to fetch event attendees: ${error.message}`)
  }
  
  return data as EventAttendee[]
}

/**
 * Get an attendee by ID
 */
export async function getEventAttendee(id: string): Promise<EventAttendee> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching event attendee:', error)
    throw new Error(`Failed to fetch event attendee: ${error.message}`)
  }
  
  return data as EventAttendee
}

/**
 * Bulk import attendees to an event
 */
export async function bulkImportAttendees(params: BulkImportAttendeesParams): Promise<EventAttendee[]> {
  const supabase = createClient()
  
  // Prepare attendees data with access codes
  const attendeesData = params.attendees.map(attendee => ({
    event_id: params.event_id,
    email: attendee.email,
    name: attendee.name,
    status: attendee.status || 'invited',
    access_code: generateRandomCode(8)
  }))
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert(attendeesData)
    .select('*')
    
  if (error) {
    console.error('Error bulk importing attendees:', error)
    throw new Error(`Failed to bulk import attendees: ${error.message}`)
  }
  
  return data as EventAttendee[]
}

/**
 * Verify attendee access code
 */
export async function verifyAttendeeAccessCode(eventId: string, accessCode: string): Promise<EventAttendee> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', eventId)
    .eq('access_code', accessCode)
    .single()
    
  if (error) {
    console.error('Error verifying access code:', error)
    throw new Error(`Invalid access code`)
  }
  
  return data as EventAttendee
}

/**
 * Get events that a user is attending
 */
export async function getAttendingEvents(): Promise<Event[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  // Get user email
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userData.user.id)
    .single()
    
  if (profileError) {
    console.error('Error fetching user profile:', profileError)
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }
  
  const userEmail = profileData.email || userData.user.email
  
  if (!userEmail) {
    throw new Error('User email not found')
  }
  
  // Get events the user is attending
  const { data, error } = await supabase
    .from('event_attendees')
    .select(`
      event:event_id(*)
    `)
    .or(`user_id.eq.${userData.user.id},email.eq.${userEmail}`)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching attending events:', error)
    throw new Error(`Failed to fetch attending events: ${error.message}`)
  }
  
  // Extract events from the nested structure
  if (!data) return []
  
  // Transform and filter the data to ensure we have valid Event objects
  const events = data
    .map(item => item.event)
    .filter((event): event is any => !!event && typeof event === 'object')
    
  return events as Event[]
}

/**
 * Duplicate an event
 */
export async function duplicateEvent(id: string): Promise<{ data: Event }> {
  const supabase = createClient()
  
  // Get the original event
  const { data: originalEvent, error: getError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
    
  if (getError) {
    console.error('Error fetching event to duplicate:', getError)
    throw new Error(`Failed to fetch event to duplicate: ${getError.message}`)
  }
  
  // Create a new event based on the original
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const newEvent = {
    name: `${originalEvent.name} (Copy)`,
    description: originalEvent.description,
    date: originalEvent.date,
    location: originalEvent.location,
    status: 'draft', // Always start as draft
    max_attendees: originalEvent.max_attendees,
    is_public: originalEvent.is_public,
    cover_image_url: originalEvent.cover_image_url,
    organizer_id: userData.user.id
  }
  
  const { data: createdEvent, error: createError } = await supabase
    .from('events')
    .insert(newEvent)
    .select('*')
    .single()
    
  if (createError) {
    console.error('Error duplicating event:', createError)
    throw new Error(`Failed to duplicate event: ${createError.message}`)
  }
  
  // Generate QR code for the duplicated event
  try {
    const { generateQRCodeUrl } = await import('@/lib/qr-code')
    const qrCodeUrl = generateQRCodeUrl({
      event_id: createdEvent.id,
      type: 'event'
    })
    
    // Update the event with the QR code URL
    await supabase
      .from('events')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', createdEvent.id)
      
    createdEvent.qr_code_url = qrCodeUrl
  } catch (qrError) {
    console.error('Error generating QR code for duplicated event:', qrError)
  }
  
  // Create a gallery for the duplicated event
  try {
    const { createGalleryForEvent } = await import('./galleries')
    await createGalleryForEvent(createdEvent.id)
  } catch (galleryError) {
    console.error('Error creating gallery for duplicated event:', galleryError)
  }
  
  return { data: createdEvent as unknown as Event }
}

/**
 * Update event status
 */
export async function updateEventStatus(id: string, status: 'draft' | 'published' | 'completed' | 'cancelled'): Promise<{ data: Event }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating event status:', error)
    throw new Error(`Failed to update event status: ${error.message}`)
  }
  
  return { data: data as unknown as Event }
}

/**
 * Get an event by its ID
 */
export async function getEventById(id: string): Promise<{ data: Event }> {
  const result = await getEvent(id)
  
  if (result.error) {
    throw new Error(`Failed to get event: ${result.error.message}`)
  }
  
  return { data: result.data as unknown as Event }
} 