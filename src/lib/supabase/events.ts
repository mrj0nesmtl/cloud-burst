import { createClient } from './client'
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
export async function createEvent(params: CreateEventParams): Promise<Event> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  // Import the QR code generation function
  const { generateQRCodeUrl } = await import('@/lib/qr-code')
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...params,
      organizer_id: userData.user.id
    })
    .select('*')
    .single()
    
  if (error) {
    console.error('Error creating event:', error)
    throw new Error(`Failed to create event: ${error.message}`)
  }
  
  // Generate QR code URL with the event ID
  const qrCodeUrl = generateQRCodeUrl({
    event_id: data.id,
    type: 'event'
  })
  
  // Update the event with the QR code URL
  const { error: updateError } = await supabase
    .from('events')
    .update({ qr_code_url: qrCodeUrl })
    .eq('id', data.id)
  
  if (updateError) {
    console.error('Error updating QR code URL:', updateError)
  }
  
  // Create a gallery for the event
  try {
    const { createGalleryForEvent } = await import('./galleries')
    await createGalleryForEvent(data.id)
  } catch (galleryError) {
    console.error('Error creating gallery for event:', galleryError)
    // Don't throw here, as the event was created successfully
  }
  
  return {
    ...data,
    qr_code_url: qrCodeUrl
  } as Event
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, params: UpdateEventParams): Promise<Event> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .update(params)
    .eq('id', id)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating event:', error)
    throw new Error(`Failed to update event: ${error.message}`)
  }
  
  return data as Event
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    
  if (error) {
    console.error('Error deleting event:', error)
    throw new Error(`Failed to delete event: ${error.message}`)
  }
}

/**
 * Get an event by ID
 */
export async function getEvent(id: string): Promise<Event> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching event:', error)
    throw new Error(`Failed to fetch event: ${error.message}`)
  }
  
  return data as Event
}

/**
 * Get an event with attendee and photo counts
 */
export async function getEventWithCounts(id: string): Promise<EventWithCounts> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      attendees_count: event_attendees(count),
      photos_count: photos(count)
    `)
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching event with counts:', error)
    throw new Error(`Failed to fetch event with counts: ${error.message}`)
  }
  
  return {
    ...data,
    attendees_count: data.attendees_count[0]?.count || 0,
    photos_count: data.photos_count[0]?.count || 0
  } as EventWithCounts
}

/**
 * Get all events for the current user
 */
export async function getUserEvents(): Promise<Event[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', userData.user.id)
    .order('date', { ascending: false })
    
  if (error) {
    console.error('Error fetching user events:', error)
    throw new Error(`Failed to fetch user events: ${error.message}`)
  }
  
  return data as Event[]
}

/**
 * Get all events for the current user with counts
 */
export async function getUserEventsWithCounts(): Promise<EventWithCounts[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      attendees_count: event_attendees(count),
      photos_count: photos(count)
    `)
    .eq('organizer_id', userData.user.id)
    .order('date', { ascending: false })
    
  if (error) {
    console.error('Error fetching user events with counts:', error)
    throw new Error(`Failed to fetch user events with counts: ${error.message}`)
  }
  
  return data.map(event => ({
    ...event,
    attendees_count: event.attendees_count[0]?.count || 0,
    photos_count: event.photos_count[0]?.count || 0
  })) as EventWithCounts[]
}

/**
 * Get public events
 */
export async function getPublicEvents(): Promise<Event[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'published')
    .order('date', { ascending: true })
    .gte('date', new Date().toISOString())
    
  if (error) {
    console.error('Error fetching public events:', error)
    throw new Error(`Failed to fetch public events: ${error.message}`)
  }
  
  return data as Event[]
}

/**
 * Add an attendee to an event
 */
export async function addEventAttendee(params: CreateAttendeeParams): Promise<EventAttendee> {
  const supabase = createClient()
  
  // Generate a random access code if not provided
  const accessCode = params.access_code || generateRandomCode(8)
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert({
      ...params,
      access_code: accessCode
    })
    .select('*')
    .single()
    
  if (error) {
    console.error('Error adding event attendee:', error)
    throw new Error(`Failed to add event attendee: ${error.message}`)
  }
  
  return data as EventAttendee
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
export async function duplicateEvent(id: string): Promise<Event> {
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
  
  return createdEvent as Event
}

/**
 * Update event status
 */
export async function updateEventStatus(id: string, status: 'draft' | 'published' | 'completed' | 'cancelled'): Promise<Event> {
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
  
  return data as Event
} 