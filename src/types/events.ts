import { Database } from './supabase'
import { UserProfile } from '@/types/auth'

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled'
export type AttendeeStatus = 'invited' | 'confirmed' | 'attended' | 'declined'

export interface Event {
  id: string
  name: string
  description: string | null
  date: string
  location: string | null
  organizer_id: string
  status: EventStatus
  max_attendees: number | null
  is_public: boolean
  cover_image_url: string | null
  qr_code_url: string | null
  created_at: string
  updated_at: string
  custom_url?: string | null
  start_date?: string
  end_date?: string
  cover_image?: string
  user_id?: string
}

export interface EventWithOrganizer extends Event {
  organizer: UserProfile
}

export interface EventWithAttendeesCount extends Event {
  attendees_count: number
}

export interface EventWithPhotosCount extends Event {
  photos_count: number
}

export interface EventWithCounts extends Event {
  attendees_count: number
  photos_count: number
}

export interface EventAttendee {
  id: string
  event_id: string
  email: string
  name: string
  status: AttendeeStatus
  access_code: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface EventAttendeeWithEvent extends EventAttendee {
  event: Event
}

export interface Photo {
  id: string
  event_id: string
  storage_path: string
  filename: string
  url?: string
  thumbnail_url?: string
  size?: number
  mime_type?: string
  width?: number | null
  height?: number | null
  uploaded_by: string | null
  is_approved: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  event?: {
    id: string
    name: string
    date: string
  }
}

export interface PhotoWithEvent extends Photo {
  event: Event
}

export interface PhotoWithUploader extends Photo {
  uploader: UserProfile | null
}

export interface CreateEventParams {
  name: string
  description?: string
  date: string
  location?: string
  status?: EventStatus
  max_attendees?: number
  is_public?: boolean
  cover_image_url?: string
}

export interface UpdateEventParams {
  name?: string
  description?: string
  date?: string
  location?: string
  status?: EventStatus
  max_attendees?: number
  is_public?: boolean
  cover_image_url?: string
  qr_code_url?: string
}

export interface CreateAttendeeParams {
  event_id: string
  email: string
  name: string
  status?: AttendeeStatus
  access_code?: string
  user_id?: string
}

export interface UpdateAttendeeParams {
  email?: string
  name?: string
  status?: AttendeeStatus
  access_code?: string
  user_id?: string
}

export interface CreatePhotoParams {
  event_id: string
  storage_path: string
  filename: string
  size: number
  mime_type: string
  width?: number | null
  height?: number | null
  uploaded_by?: string | null
  is_approved?: boolean
  metadata?: Record<string, any>
}

export interface UpdatePhotoParams {
  storage_path?: string
  filename?: string
  size?: number
  mime_type?: string
  width?: number
  height?: number
  is_approved?: boolean
  metadata?: Record<string, any>
}

export interface BulkImportAttendeesParams {
  event_id: string
  attendees: Array<{
    email: string
    name: string
    status?: AttendeeStatus
  }>
}

export interface QRCodeParams {
  event_id: string
  type: 'event' | 'gallery' | 'check-in' | 'attendee'
  attendee_id?: string
  size?: number
}

// Database types
export type DbEvent = Database['public']['Tables']['events']['Row']
export type DbPhoto = Database['public']['Tables']['photos']['Row']

export interface PhotoMetadata {
  tags?: string[];
  caption?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
  camera?: {
    make?: string;
    model?: string;
  };
  [key: string]: any;
}

export type SortOption = 'newest' | 'oldest' | 'popular';

export type GalleryLayout = 'grid' | 'masonry' | 'slideshow';

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: 'organizer' | 'photographer' | 'guest';
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 