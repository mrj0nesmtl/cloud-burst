import { Database } from './supabase';
import { Json } from '@/types/supabase'
import { RsvpStatus } from '@/types/invitations';

/**
 * RSVP database row type
 */
export type RsvpRow = Database['public']['Tables']['rsvps']['Row'];

/**
 * RSVP insert type
 */
export type RsvpInsert = Database['public']['Tables']['rsvps']['Insert'];

/**
 * RSVP update type
 */
export type RsvpUpdate = Database['public']['Tables']['rsvps']['Update'];

/**
 * RSVP form values
 */
export interface RsvpFormValues {
  status: RsvpStatus | string;
  guestCount: number;
  plusOne: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  notes?: string;
}

/**
 * RSVP with invitation details
 */
export interface RsvpWithInvitation extends RsvpRow {
  invitation: {
    id: string;
    event_id: string;
    name: string | null;
    email: string | null;
    token: string;
    status: string;
  };
  event: {
    id: string;
    name: string;
    date: string | null;
    location: string | null;
  };
}

/**
 * RSVP submission response
 */
export interface RsvpSubmissionResponse {
  success: boolean;
  message: string;
  rsvp?: RsvpRow;
  error?: string;
}

export interface InvitationMetadata {
  plus_one_allowed?: boolean;
  plus_one_used?: boolean;
  plus_one_name?: string | null;
  [key: string]: any;
}

export interface Invitation {
  id: string;
  event_id: string;
  email: string | null;
  name: string | null;
  token: string;
  status: string;
  rsvp_status: string | null;
  rsvp_date: string | null;
  expires_at: string | null;
  metadata: InvitationMetadata;
  created_at: string;
  sent_at: string | null;
  updated_at: string;
}

export interface RSVP {
  id: string;
  invitation_id: string;
  status: string;
  guest_count: number;
  dietary_restrictions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
} 