export type Database = {
  public: {
    Tables: {
      contact_form_submissions: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          created_at: string
          status: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          created_at?: string
          status?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          created_at?: string
          status?: string | null
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          location: string
          created_at: string
          updated_at: string | null
          user_id: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          location: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          status?: string
        }
      }
      galleries: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      media: {
        Row: {
          id: string
          url: string
          type: string
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          url: string
          type: string
          created_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          url?: string
          type?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      photos: {
        Row: {
          id: string
          url: string
          gallery_id: string
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          url: string
          gallery_id: string
          created_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          url?: string
          gallery_id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          role: string
          subscription_tier: string
          subscription_status: string
          trial_expires_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string
          subscription_tier?: string
          subscription_status?: string
          trial_expires_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string
          subscription_tier?: string
          subscription_status?: string
          trial_expires_at?: string | null
          trial_started_at?: string | null
        }
      }
      roles: {
        Row: {
          name: string
          description: string
          created_at: string
        }
        Insert: {
          name: string
          description: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          created_at?: string
        }
      }
      role_capabilities: {
        Row: {
          role: string
          capability: string
          created_at: string
        }
        Insert: {
          role: string
          capability: string
          created_at?: string
        }
        Update: {
          role?: string
          capability?: string
          created_at?: string
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
  }
}
