import { Database } from './supabase';

// Invitation Types
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'expired' | 'active' | 'used' | 'confirmed';
export type RsvpStatus = 'pending' | 'yes' | 'no' | 'maybe';

export interface Invitation {
  id: string;
  event_id: string;
  email: string;
  name: string | null;
  status: InvitationStatus;
  rsvp_status: RsvpStatus;
  token: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  expires_at: string | null;
  metadata: {
    notes?: string;
    dietary_preferences?: string;
    plus_one_allowed?: boolean;
    plus_one_used?: boolean;
    magic_link?: string;
  } | null;
}

export interface InvitationWithEvent extends Invitation {
  event: {
    id: string;
    name: string;
    date: string;
    status: string;
  };
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string | null;
  invitation_id: string;
  name: string;
  email: string;
  status: 'invited' | 'confirmed' | 'attended' | 'declined';
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

// Type-safe database types
export type DbInvitation = Database['public']['Tables']['invitations']['Row'];
export type DbEventAttendee = Database['public']['Tables']['event_attendees']['Row']; 