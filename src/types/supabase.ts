Need to install the following packages:
supabase@2.15.8
Ok to proceed? (y) 

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
        Relationships: []
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          email: string
          name: string
          status: string
          access_code: string | null
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
          access_code?: string | null
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
          access_code?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string
          location: string | null
          organizer_id: string
          status: string
          max_attendees: number | null
          is_public: boolean
          cover_image_url: string | null
          qr_code_url: string | null
          created_at: string
          updated_at: string | null
          custom_url: string | null
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date: string
          location?: string | null
          organizer_id: string
          status?: string
          max_attendees?: number | null
          is_public?: boolean
          cover_image_url?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string | null
          custom_url?: string | null
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string
          location?: string | null
          organizer_id?: string
          status?: string
          max_attendees?: number | null
          is_public?: boolean
          cover_image_url?: string | null
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string | null
          custom_url?: string | null
          start_date?: string | null
          end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      galleries: {
        Row: {
          id: string
          event_id: string
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      photos: {
        Row: {
          id: string
          event_id: string
          storage_path: string
          filename: string
          size: number
          mime_type: string
          width: number | null
          height: number | null
          uploaded_by: string | null
          is_approved: boolean
          metadata: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          storage_path: string
          filename: string
          size: number
          mime_type: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          is_approved?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          storage_path?: string
          filename?: string
          size?: number
          mime_type?: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          is_approved?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          role: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string | null
          preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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