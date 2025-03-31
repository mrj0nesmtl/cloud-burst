import { Database } from './supabase';

// Invitation Types
export enum InvitationStatus {
  SENT = 'sent',
  OPENED = 'opened',
  EXPIRED = 'expired'
}

export enum RsvpStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  PENDING = 'pending'
}

export interface InvitationMetadata {
  notes?: string;
  dietary_preferences?: string;
  plus_one_allowed?: boolean;
  plus_one_used?: boolean;
  plus_one_name?: string;
  magic_link?: string;
}

export interface Invitation {
  id: string;
  event_id: string;
  email: string;
  name: string;
  token: string;
  status: InvitationStatus | string;
  rsvp_status: RsvpStatus | string | null;
  rsvp_date?: string | null;
  expires_at: string | null;
  metadata: InvitationMetadata | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
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