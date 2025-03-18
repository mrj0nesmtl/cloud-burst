// src/types/invitations.ts
export type InvitationStatus = 'pending' | 'sent' | 'used' | 'expired' | 'cancelled';
export type RsvpStatus = 'pending' | 'yes' | 'no' | 'maybe';

export interface Invitation {
  id: string;
  event_id: string;
  email: string;
  name: string;
  status: InvitationStatus;
  token: string;
  sent_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  metadata: {
    message?: string;
    dietary_preferences?: string;
    notes?: string;
    [key: string]: any;
  };
  rsvp_status: RsvpStatus;
  rsvp_date: string | null;
  plus_one_allowed: boolean;
  plus_one_used: boolean;
}