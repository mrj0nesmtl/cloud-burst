export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'super_admin' | 'admin' | 'event_host' | 'user' | 'guest'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          updated_at?: string
          created_at?: string
        }
        Update: {
          username?: string | null
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          updated_at?: string
        }
      }
      role_capabilities: {
        Row: {
          id: string
          role: UserRole
          capability: string
          created_at: string
        }
        Insert: {
          id?: string
          role: UserRole
          capability: string
          created_at?: string
        }
        Update: {
          role?: UserRole
          capability?: string
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          location: string | null
          cover_image: string | null
          is_public: boolean
          user_id: string
          custom_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          location?: string | null
          cover_image?: string | null
          is_public: boolean
          user_id: string
          custom_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          location?: string | null
          cover_image?: string | null
          is_public?: boolean
          user_id?: string
          custom_url?: string | null
        }
      }
      photos: {
        Row: {
          id: string
          event_id: string
          filename: string
          storage_path: string
          url: string
          thumbnail_url: string | null
          uploaded_by: string
          created_at: string
          updated_at: string | null
          is_approved: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          event_id: string
          filename: string
          storage_path: string
          url: string
          thumbnail_url?: string | null
          uploaded_by: string
          created_at?: string
          updated_at?: string | null
          is_approved: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          event_id?: string
          filename?: string
          storage_path?: string
          url?: string
          thumbnail_url?: string | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string | null
          is_approved?: boolean
          metadata?: Json
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          role: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string | null
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          role?: string
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
      user_role: UserRole
    }
  }
}

// Helper types for common operations
export type TablesInsertPayload<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdatePayload<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type TablesRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

// Specific table types for easier imports
export type EventRow = TablesRow<'events'>
export type EventInsert = TablesInsertPayload<'events'>
export type EventUpdate = TablesUpdatePayload<'events'>

export type PhotoRow = TablesRow<'photos'>
export type PhotoInsert = TablesInsertPayload<'photos'>
export type PhotoUpdate = TablesUpdatePayload<'photos'>

export type UserRow = TablesRow<'users'>
export type UserInsert = TablesInsertPayload<'users'>
export type UserUpdate = TablesUpdatePayload<'users'>

export type EventParticipantRow = TablesRow<'event_participants'>
export type EventParticipantInsert = TablesInsertPayload<'event_participants'>
export type EventParticipantUpdate = TablesUpdatePayload<'event_participants'> 