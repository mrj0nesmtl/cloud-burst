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
  BulkImportAttendeesParams,
  DbEvent
} from '@/types/events'
import { generateRandomCode } from '@/lib/utils'
import { createServerClient } from './server'
import { cookies } from 'next/headers'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// TODO: Fix import when admin-client is implemented
// import { createAdminClient } from './admin-client'

/**
 * IMPORTANT TECHNICAL DEBT NOTICE: 
 * ---------------------------------
 * This file contains numerous type assertions (as any) as a workaround for
 * TypeScript errors related to Supabase's query builder and database types.
 * 
 * The proper solution would be to:
 * 1. Generate accurate database types using the Supabase CLI
 * 2. Create proper type-safe abstractions over the Supabase client
 * 3. Implement comprehensive error handling for all database operations
 * 
 * Until then, @ts-ignore and type assertions are used to maintain functionality
 * while acknowledging the technical debt. This approach is documented here:
 * https://supabase.com/docs/reference/javascript/typescript-support
 */

// Type helpers for Supabase operations
type EventsRow = Database['public']['Tables']['events']['Row'];
type EventsInsert = Database['public']['Tables']['events']['Insert'];
type EventsUpdate = Database['public']['Tables']['events']['Update'];
type EventAttendeesRow = Database['public']['Tables']['event_attendees']['Row'];
type EventAttendeesInsert = Database['public']['Tables']['event_attendees']['Insert'];
type EventAttendeesUpdate = Database['public']['Tables']['event_attendees']['Update'];
type GalleriesRow = Database['public']['Tables']['galleries']['Row'];
type InvitationsRow = Database['public']['Tables']['invitations']['Row'];
type PhotosRow = Database['public']['Tables']['photos']['Row'];
type ProfilesRow = Database['public']['Tables']['profiles']['Row'];

// Helper function to safely convert from our API types to Supabase types
function toEventsInsert(params: CreateEventParams & { id: string; organizer_id: string; qr_code_url: string; status: string }): EventsInsert {
  return {
    id: params.id,
    name: params.name,
    description: params.description || null,
    date: params.date,
    location: params.location || null,
    organizer_id: params.organizer_id,
    status: params.status,
    max_attendees: params.max_attendees || null,
    is_public: params.is_public || false,
    cover_image_url: params.cover_image_url || null,
    qr_code_url: params.qr_code_url || null,
    // Add other fields as necessary
  };
}

function toEventsUpdate(params: UpdateEventParams): EventsUpdate {
  const update: EventsUpdate = {};
  
  if (params.name !== undefined) update.name = params.name;
  if (params.description !== undefined) update.description = params.description;
  if (params.date !== undefined) update.date = params.date;
  if (params.location !== undefined) update.location = params.location;
  if (params.status !== undefined) update.status = params.status;
  if (params.max_attendees !== undefined) update.max_attendees = params.max_attendees;
  if (params.is_public !== undefined) update.is_public = params.is_public;
  if (params.cover_image_url !== undefined) update.cover_image_url = params.cover_image_url;
  if (params.qr_code_url !== undefined) update.qr_code_url = params.qr_code_url;
  
  return update;
}

function toEventAttendeesInsert(params: { 
  event_id: string; 
  email: string; 
  name: string; 
  status?: string;
  access_code: string;
  created_at?: string;
}): EventAttendeesInsert {
  return {
    event_id: params.event_id,
    email: params.email,
    name: params.name,
    status: params.status || 'invited',
    access_code: params.access_code,
    created_at: params.created_at || new Date().toISOString()
  };
}

function toEventAttendeesUpdate(params: UpdateAttendeeParams): EventAttendeesUpdate {
  const update: EventAttendeesUpdate = {};
  
  if (params.email !== undefined) update.email = params.email;
  if (params.name !== undefined) update.name = params.name;
  if (params.status !== undefined) update.status = params.status;
  if (params.access_code !== undefined) update.access_code = params.access_code;
  if (params.user_id !== undefined) update.user_id = params.user_id;
  
  return update;
}

// Helper function to safely convert from Supabase rows to our API types
function toEvent(row: EventsRow): Event {
  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    date: row.date,
    location: row.location || null,
    organizer_id: row.organizer_id || '',
    status: row.status as Event['status'],
    max_attendees: row.max_attendees || null,
    is_public: row.is_public || false,
    cover_image_url: row.cover_image_url || null,
    qr_code_url: row.qr_code_url || null,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
    // Add other mappings as needed
  };
}

function toEventAttendee(row: EventAttendeesRow): EventAttendee {
  return {
    id: row.id,
    event_id: row.event_id || '',
    email: row.email,
    name: row.name,
    status: row.status as EventAttendee['status'],
    access_code: row.access_code,
    user_id: row.user_id,
    created_at: row.created_at || '',
    updated_at: row.updated_at || ''
  };
}

/**
 * NOTE: This file contains multiple type assertions (as any) 
 * to work around TypeScript's type checking limitations with Supabase queries.
 * These assertions are necessary because the generated Supabase types
 * are often too strict for the actual API usage patterns.
 * 
 * TECHNICAL DEBT: This file has several remaining TypeScript errors that should
 * be addressed in a future refactoring:
 * 
 * 1. The Supabase query builder's type system is creating conflicts with our custom types
 * 2. Type assertions (as any) are used as a temporary solution
 * 3. A more robust approach would be to:
 *    - Generate proper database types using Supabase's CLI
 *    - Create proper mapping functions between DB and domain types
 *    - Implement proper error handling for all Supabase operations
 * 
 * TODO: Refactor this file to use proper type-safe Supabase operations
 */

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
    
    // Convert to Supabase type and insert the event
    const supabaseData = toEventsInsert(completeEventData);
    
    // Insert the event into the database
    const { data: event, error: createError } = await supabase
      .from('events')
      .insert(supabaseData as any)
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
    
    return { data: safeToEvent(event) }
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
  
  // Validate and fix QR code URL if needed
  if (updates.qr_code_url !== undefined && 
      (!updates.qr_code_url || !updates.qr_code_url.includes('api.qrserver.com'))) {
    // Generate proper QR code URL
    updates.qr_code_url = generateQRCodeUrl({
      event_id: eventId,
      type: 'gallery'
    })
  }
  
  // Convert to Supabase type
  const supabaseUpdates = toEventsUpdate(updates);
  
  const { data, error } = await supabase
    .from('events')
    .update(supabaseUpdates as any)
    .eq('id', eventId as any)
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
      .eq('event_id', eventId as any)
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
  
  return { data: safeToEvent(data) }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId as any)
  
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
    .eq('id', eventId as any)
    .single()
  
  if (error) {
    console.error('Error fetching event:', error)
    return { error }
  }
  
  return { data: safeToEvent(data) }
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
    .eq('id', eventId as any)
    .single()
  
  if (eventError) {
    console.error('Error fetching event:', eventError)
    return { error: eventError }
  }
  
  // Get attendee count
  const { count: attendeeCount, error: attendeeError } = await supabase
    .from('event_attendees')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId as any)
  
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
    .eq('event_id', eventId as any)
    .maybeSingle()
  
  if (!galleryError && gallery && 'id' in gallery && gallery.id) {
    // Then get the photo count
    const { count, error: photoError } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('gallery_id', gallery.id as any)
    
    if (!photoError) {
      photoCount = count || 0
    }
  }
  
  const eventData = event && !('error' in event) ? toEvent(event as EventsRow) : null;
  
  return { 
    data: eventData ? {
      ...eventData,
      attendeeCount: attendeeCount || 0,
      photoCount
    } : null
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
    .eq('organizer_id', user.id as any)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user events:', error)
    return { error }
  }
  
  return { data: Array.isArray(data) ? data.map(row => safeToEvent(row as any)).filter(Boolean) as Event[] : [] }
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
    .eq('organizer_id', user.id as any)
    .order('created_at', { ascending: false })
  
  if (eventsError) {
    console.error('Error fetching user events:', eventsError)
    return { error: eventsError }
  }
  
  if (!events || !Array.isArray(events)) {
    return { data: [] }
  }
  
  // Get all attendees for these events - ensure events have valid IDs
  // @ts-ignore: Type assertion to bypass TypeScript limitations with Supabase query results
  const eventIds = events.filter(e => e && typeof e === 'object' && 'id' in e && e.id)
    .map(e => (e as any).id)
  
  // Get all attendees for these events
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
      if (attendee && 'event_id' in attendee && attendee.event_id) {
        attendeeCountMap[attendee.event_id] = (attendeeCountMap[attendee.event_id] || 0) + 1
      }
    })
  }
  
  // Add attendee counts to events
  const eventsData = Array.isArray(events) 
    ? events.map(event => {
      const eventData = safeToEvent(event as any);
      return eventData ? {
        ...eventData,
        attendeeCount: ((event as any)?.id && typeof attendeeCountMap[(event as any).id] === 'number') 
          ? attendeeCountMap[(event as any).id] 
          : 0
      } : null;
    }).filter(Boolean)
    : [];
  
  return { data: eventsData }
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
    .eq('is_public', true as any)
    .eq('status', 'published' as any)
    .gte('date', now)
    .order('date', { ascending: true })
  
  if (error) {
    console.error('Error fetching public events:', error)
    return { error }
  }
  
  return { data: Array.isArray(data) ? data.map(row => safeToEvent(row as any)).filter(Boolean) as Event[] : [] }
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
  
  const supabaseData = toEventAttendeesInsert(completeAttendeeData);
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert(supabaseData as any)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding event attendee:', error)
    return { error }
  }
  
  return { data: safeToEventAttendee(data) }
}

/**
 * Update an event attendee
 */
export async function updateEventAttendee(id: string, params: UpdateAttendeeParams): Promise<EventAttendee> {
  const supabase = createClient()
  
  const supabaseUpdates = toEventAttendeesUpdate(params);
  
  const { data, error } = await supabase
    .from('event_attendees')
    .update(supabaseUpdates as any)
    .eq('id', id as any)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating event attendee:', error)
    throw new Error(`Failed to update event attendee: ${error.message}`)
  }
  
  if (!data || 'error' in data) {
    throw new Error('Failed to retrieve event attendee after update')
  }
  
  return toEventAttendee(data as any)
}

/**
 * Delete an event attendee
 */
export async function deleteEventAttendee(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('id', id as any)
    
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
    .eq('event_id', eventId as any)
    .order('created_at', { ascending: true })
    
  if (error) {
    console.error('Error fetching event attendees:', error)
    throw new Error(`Failed to fetch event attendees: ${error.message}`)
  }
  
  // Use type assertions to bypass TypeScript limitations
  const attendees = Array.isArray(data) 
    ? data.map(row => safeToEventAttendee(row as any))
    : [];
  
  // Filter out null values
  return attendees.filter(Boolean) as EventAttendee[]
}

/**
 * Get an attendee by ID
 */
export async function getEventAttendee(id: string): Promise<EventAttendee> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('id', id as any)
    .single()
    
  if (error) {
    console.error('Error fetching event attendee:', error)
    throw new Error(`Failed to fetch event attendee: ${error.message}`)
  }
  
  if (!data || 'error' in data) {
    throw new Error('Failed to retrieve event attendee')
  }
  
  return toEventAttendee(data as any)
}

/**
 * Bulk import attendees to an event
 */
export async function bulkImportAttendees(params: BulkImportAttendeesParams): Promise<EventAttendee[]> {
  const supabase = createClient()
  
  // Prepare attendees data with access codes
  const attendeesData = params.attendees.map(attendee => 
    toEventAttendeesInsert({
      event_id: params.event_id,
      email: attendee.email,
      name: attendee.name,
      status: attendee.status || 'invited',
      access_code: generateRandomCode(8)
    })
  )
  
  const { data, error } = await supabase
    .from('event_attendees')
    .insert(attendeesData as any)
    .select('*')
    
  if (error) {
    console.error('Error bulk importing attendees:', error)
    throw new Error(`Failed to bulk import attendees: ${error.message}`)
  }
  
  // Use type assertions to bypass TypeScript limitations
  const attendees = Array.isArray(data) 
    ? data.map(row => safeToEventAttendee(row as any))
    : [];
  
  // Filter out null values
  return attendees.filter(Boolean) as EventAttendee[]
}

/**
 * Verify attendee access code
 */
export async function verifyAttendeeAccessCode(eventId: string, accessCode: string): Promise<EventAttendee> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', eventId as any)
    .eq('access_code', accessCode as any)
    .single()
    
  if (error) {
    console.error('Error verifying access code:', error)
    throw new Error(`Invalid access code`)
  }
  
  if (!data || 'error' in data) {
    throw new Error('Failed to retrieve event attendee with access code')
  }
  
  return toEventAttendee(data as any)
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
    .eq('id', userData.user.id as any)
    .single()
    
  if (profileError) {
    console.error('Error fetching user profile:', profileError)
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }
  
  const userEmail = (profileData && 'email' in profileData) ? profileData.email : userData.user.email
  
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
  
  // Extract events from the nested structure and handle errors/null values
  if (!data) return []
  
  // Transform and filter the data with aggressive type assertions
  const events = Array.isArray(data)
    ? data
        .filter(item => item && typeof item === 'object')
        .map(item => {
          // Safely check and extract the event
          const eventData = item && typeof item === 'object' && 'event' in item ? (item as any).event : null;
          return eventData ? safeToEvent(eventData as any) : null;
        })
        .filter(Boolean) as Event[] // Remove nulls
    : [];
  
  return events
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
    .eq('id', id as any)
    .single()
    
  if (getError) {
    console.error('Error fetching event to duplicate:', getError)
    throw new Error(`Failed to fetch event to duplicate: ${getError.message}`)
  }
  
  if (!originalEvent) {
    throw new Error('Event not found')
  }
  
  // Use type assertion for the event data
  const eventData = originalEvent as unknown as EventsRow;
  
  // Create a new event based on the original
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const newEvent: EventsInsert = {
    name: `${eventData.name} (Copy)`,
    description: eventData.description,
    date: eventData.date,
    location: eventData.location,
    status: 'draft', // Always start as draft
    max_attendees: eventData.max_attendees,
    is_public: eventData.is_public,
    cover_image_url: eventData.cover_image_url,
    organizer_id: userData.user.id
  }
  
  const { data: createdEvent, error: createError } = await supabase
    .from('events')
    .insert(newEvent as any)
    .select('*')
    .single()
    
  if (createError) {
    console.error('Error duplicating event:', createError)
    throw new Error(`Failed to duplicate event: ${createError.message}`)
  }
  
  if (!createdEvent || 'error' in createdEvent) {
    throw new Error('Failed to create duplicated event')
  }
  
  const createdEventData = createdEvent as any;
  
  // Generate QR code for the duplicated event
  try {
    const { generateQRCodeUrl } = await import('@/lib/qr-code')
    const qrCodeUrl = generateQRCodeUrl({
      event_id: createdEventData.id,
      type: 'event'
    })
    
    // Update the event with the QR code URL
    await supabase
      .from('events')
      .update({ qr_code_url: qrCodeUrl } as any)
      .eq('id', createdEventData.id as any)
      
    createdEventData.qr_code_url = qrCodeUrl
  } catch (qrError) {
    console.error('Error generating QR code for duplicated event:', qrError)
  }
  
  // Create a gallery for the duplicated event
  try {
    const { createGalleryForEvent } = await import('./galleries')
    await createGalleryForEvent(createdEventData.id)
  } catch (galleryError) {
    console.error('Error creating gallery for duplicated event:', galleryError)
  }
  
  return { data: safeToEvent(createdEventData) || {} as Event }
}

/**
 * Update event status
 */
export async function updateEventStatus(id: string, status: 'draft' | 'published' | 'completed' | 'cancelled'): Promise<{ data: Event }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .update({ status } as any)
    .eq('id', id as any)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating event status:', error)
    throw new Error(`Failed to update event status: ${error.message}`)
  }
  
  if (!data || 'error' in data) {
    throw new Error('Failed to retrieve event after status update')
  }
  
  const event = safeToEvent(data as any);
  if (!event) {
    throw new Error('Failed to parse event data after status update')
  }
  
  return { data: event }
}

/**
 * Get an event by ID
 * @param eventId The event ID
 * @returns Event object or null if not found
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId as any)
    .single()
  
  if (error) {
    console.error('Error fetching event:', error)
    return null
  }
  
  return safeToEvent(data as any)
}

/**
 * Get RSVP statistics for an event
 */
export async function getEventRsvpStats(eventId: string) {
  const supabase = createClient();
  
  console.log('Fetching RSVP stats for event:', eventId);
  
  // Get all invitations for this event
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('id, rsvp_status, rsvp_date')
    .eq('event_id', eventId as any);
    
  if (error) {
    console.error('Error fetching RSVP stats:', error);
    return {
      total: 0,
      accepted: 0,
      declined: 0,
      pending: 0
    };
  }
  
  console.log('Found invitations:', invitations.length);
  
  // Count by status
  const stats = {
    total: invitations.length,
    accepted: invitations.filter(inv => 
      inv && 'rsvp_status' in inv && (inv.rsvp_status === 'yes' || inv.rsvp_status === 'accepted')
    ).length,
    declined: invitations.filter(inv => 
      inv && 'rsvp_status' in inv && (inv.rsvp_status === 'no' || inv.rsvp_status === 'declined')
    ).length,
    pending: invitations.filter(inv => 
      !inv || !('rsvp_status' in inv) || !inv.rsvp_status || inv.rsvp_status === 'pending'
    ).length
  };
  
  console.log('RSVP stats:', stats);
  
  return stats;
}

function safeToEvent(data: any): Event | null {
  if (!data || data.error || typeof data !== 'object' || !('id' in data)) {
    return null;
  }
  return toEvent(data as EventsRow);
}

function safeToEventAttendee(data: any): EventAttendee | null {
  if (!data || typeof data !== 'object' || !('id' in data)) {
    return null;
  }
  return toEventAttendee(data as EventAttendeesRow);
} 