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