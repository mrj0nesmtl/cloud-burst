export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string
          location: string | null
          organizer_id: string | null
          status: string
          max_attendees: number | null
          is_public: boolean
          cover_image_url: string | null
          qr_code_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date: string
          location?: string | null
          organizer_id?: string | null
          status?: string
          max_attendees?: number | null
          is_public?: boolean
          cover_image_url?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string
          location?: string | null
          organizer_id?: string | null
          status?: string
          max_attendees?: number | null
          is_public?: boolean
          cover_image_url?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          email: string
          name: string
          status: string
          access_code: string
          user_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          email: string
          name: string
          status?: string
          access_code: string
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          email?: string
          name?: string
          status?: string
          access_code?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      galleries: {
        Row: {
          id: string
          event_id: string
          name: string | null
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          name?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          event_id: string
          email: string
          name: string | null
          token: string
          rsvp_status: string | null
          rsvp_date: string | null
          sent_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          email: string
          name?: string | null
          token: string
          rsvp_status?: string | null
          rsvp_date?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          email?: string
          name?: string | null
          token?: string
          rsvp_status?: string | null
          rsvp_date?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      photos: {
        Row: {
          id: string
          gallery_id: string
          user_id: string | null
          url: string
          thumbnail_url: string | null
          title: string | null
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          gallery_id: string
          user_id?: string | null
          url: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          gallery_id?: string
          user_id?: string | null
          url?: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      guests: {
        Row: {
          id: string
          invitation_id: string
          name: string
          email: string
          phone: string | null
          notes: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          name: string
          email: string
          phone?: string | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          name?: string
          email?: string
          phone?: string | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      rsvps: {
        Row: {
          id: string
          invitation_id: string
          status: string
          guest_count: number
          guest_name: string | null
          guest_email: string | null
          guest_phone: string | null
          guest_notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          invitation_id: string
          status: string
          guest_count: number
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          invitation_id?: string
          status?: string
          guest_count?: number
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
