import { create } from 'zustand'
import { Event, EventWithCounts, EventAttendee } from '@/types/events'
import { 
  getUserEvents, 
  getUserEventsWithCounts,
  getEvent,
  getEventWithCounts,
  getEventAttendees,
  getPublicEvents
} from '@/lib/supabase/events'

interface EventsState {
  // Events data
  events: Event[]
  currentEvent: Event | null
  currentEventWithCounts: EventWithCounts | null
  publicEvents: Event[]
  attendees: EventAttendee[]
  
  // Loading states
  isLoadingEvents: boolean
  isLoadingCurrentEvent: boolean
  isLoadingPublicEvents: boolean
  isLoadingAttendees: boolean
  
  // Error states
  eventsError: Error | null
  currentEventError: Error | null
  publicEventsError: Error | null
  attendeesError: Error | null
  
  // Actions
  fetchUserEvents: () => Promise<void>
  fetchUserEventsWithCounts: () => Promise<void>
  fetchEvent: (id: string) => Promise<void>
  fetchEventWithCounts: (id: string) => Promise<void>
  fetchEventAttendees: (eventId: string) => Promise<void>
  fetchPublicEvents: () => Promise<void>
  setCurrentEvent: (event: Event | null) => void
  clearErrors: () => void
}

export const useEventsStore = create<EventsState>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  currentEventWithCounts: null,
  publicEvents: [],
  attendees: [],
  
  isLoadingEvents: false,
  isLoadingCurrentEvent: false,
  isLoadingPublicEvents: false,
  isLoadingAttendees: false,
  
  eventsError: null,
  currentEventError: null,
  publicEventsError: null,
  attendeesError: null,
  
  // Fetch user events
  fetchUserEvents: async () => {
    set({ isLoadingEvents: true, eventsError: null })
    
    try {
      const events = await getUserEvents()
      set({ events, isLoadingEvents: false })
    } catch (error) {
      console.error('Error fetching user events:', error)
      set({ 
        eventsError: error instanceof Error ? error : new Error('Failed to fetch user events'), 
        isLoadingEvents: false 
      })
    }
  },
  
  // Fetch user events with counts
  fetchUserEventsWithCounts: async () => {
    set({ isLoadingEvents: true, eventsError: null })
    
    try {
      const eventsWithCounts = await getUserEventsWithCounts()
      set({ 
        events: eventsWithCounts, 
        isLoadingEvents: false 
      })
    } catch (error) {
      console.error('Error fetching user events with counts:', error)
      set({ 
        eventsError: error instanceof Error ? error : new Error('Failed to fetch user events with counts'), 
        isLoadingEvents: false 
      })
    }
  },
  
  // Fetch a single event
  fetchEvent: async (id: string) => {
    set({ isLoadingCurrentEvent: true, currentEventError: null })
    
    try {
      const event = await getEvent(id)
      set({ currentEvent: event, isLoadingCurrentEvent: false })
    } catch (error) {
      console.error('Error fetching event:', error)
      set({ 
        currentEventError: error instanceof Error ? error : new Error('Failed to fetch event'), 
        isLoadingCurrentEvent: false 
      })
    }
  },
  
  // Fetch a single event with counts
  fetchEventWithCounts: async (id: string) => {
    set({ isLoadingCurrentEvent: true, currentEventError: null })
    
    try {
      const eventWithCounts = await getEventWithCounts(id)
      set({ 
        currentEvent: eventWithCounts,
        currentEventWithCounts: eventWithCounts,
        isLoadingCurrentEvent: false 
      })
    } catch (error) {
      console.error('Error fetching event with counts:', error)
      set({ 
        currentEventError: error instanceof Error ? error : new Error('Failed to fetch event with counts'), 
        isLoadingCurrentEvent: false 
      })
    }
  },
  
  // Fetch event attendees
  fetchEventAttendees: async (eventId: string) => {
    set({ isLoadingAttendees: true, attendeesError: null })
    
    try {
      const attendees = await getEventAttendees(eventId)
      set({ attendees, isLoadingAttendees: false })
    } catch (error) {
      console.error('Error fetching event attendees:', error)
      set({ 
        attendeesError: error instanceof Error ? error : new Error('Failed to fetch event attendees'), 
        isLoadingAttendees: false 
      })
    }
  },
  
  // Fetch public events
  fetchPublicEvents: async () => {
    set({ isLoadingPublicEvents: true, publicEventsError: null })
    
    try {
      const publicEvents = await getPublicEvents()
      set({ publicEvents, isLoadingPublicEvents: false })
    } catch (error) {
      console.error('Error fetching public events:', error)
      set({ 
        publicEventsError: error instanceof Error ? error : new Error('Failed to fetch public events'), 
        isLoadingPublicEvents: false 
      })
    }
  },
  
  // Set current event
  setCurrentEvent: (event: Event | null) => {
    set({ currentEvent: event })
  },
  
  // Clear all errors
  clearErrors: () => {
    set({ 
      eventsError: null,
      currentEventError: null,
      publicEventsError: null,
      attendeesError: null
    })
  }
})) 