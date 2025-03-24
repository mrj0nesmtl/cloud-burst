export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      album_media: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          media_id: string
          sort_order: number
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          media_id: string
          sort_order?: number
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          media_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_media_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_media_id: string | null
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_media_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_media_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_form_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          access_code: string | null
          check_in_method: string | null
          check_in_time: string | null
          created_at: string | null
          email: string
          event_id: string | null
          id: string
          invitation_id: string | null
          name: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_code?: string | null
          check_in_method?: string | null
          check_in_time?: string | null
          created_at?: string | null
          email: string
          event_id?: string | null
          id?: string
          invitation_id?: string | null
          name: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_code?: string | null
          check_in_method?: string | null
          check_in_time?: string | null
          created_at?: string | null
          email?: string
          event_id?: string | null
          id?: string
          invitation_id?: string | null
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "event_attendees_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_customization: {
        Row: {
          accent_color: string
          allow_guest_chat: boolean
          auto_post_to_facebook: boolean
          auto_post_to_instagram: boolean
          auto_post_to_twitter: boolean
          chat_welcome_message: string | null
          created_at: string | null
          enable_live_chat: boolean
          enable_social_sharing: boolean
          event_description: string | null
          event_id: string | null
          event_logo: string | null
          event_name: string | null
          gallery_layout: string
          id: string
          moderate_chat: boolean
          photo_display_duration: number
          primary_color: string
          secondary_color: string
          show_photo_info: boolean
          social_sharing_message: string | null
          thumbnail_size: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accent_color?: string
          allow_guest_chat?: boolean
          auto_post_to_facebook?: boolean
          auto_post_to_instagram?: boolean
          auto_post_to_twitter?: boolean
          chat_welcome_message?: string | null
          created_at?: string | null
          enable_live_chat?: boolean
          enable_social_sharing?: boolean
          event_description?: string | null
          event_id?: string | null
          event_logo?: string | null
          event_name?: string | null
          gallery_layout?: string
          id?: string
          moderate_chat?: boolean
          photo_display_duration?: number
          primary_color?: string
          secondary_color?: string
          show_photo_info?: boolean
          social_sharing_message?: string | null
          thumbnail_size?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accent_color?: string
          allow_guest_chat?: boolean
          auto_post_to_facebook?: boolean
          auto_post_to_instagram?: boolean
          auto_post_to_twitter?: boolean
          chat_welcome_message?: string | null
          created_at?: string | null
          enable_live_chat?: boolean
          enable_social_sharing?: boolean
          event_description?: string | null
          event_id?: string | null
          event_logo?: string | null
          event_name?: string | null
          gallery_layout?: string
          id?: string
          moderate_chat?: boolean
          photo_display_duration?: number
          primary_color?: string
          secondary_color?: string
          show_photo_info?: boolean
          social_sharing_message?: string | null
          thumbnail_size?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_customization_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          payment_amount: number | null
          payment_id: string | null
          payment_status: string | null
          registration_type: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          registration_type: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          payment_status?: string | null
          registration_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_staff: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          accent_color: string | null
          capacity: number | null
          color_scheme: string | null
          cover_image_url: string | null
          created_at: string | null
          custom_url: string | null
          date: string
          description: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_public: boolean | null
          location: string | null
          logo_url: string | null
          max_attendees: number | null
          name: string
          organizer_id: string | null
          price: number | null
          qr_code_url: string | null
          status: string
          twitter_url: string | null
          updated_at: string | null
          use_logo_as_main_image: boolean | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          capacity?: number | null
          color_scheme?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          date: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          max_attendees?: number | null
          name: string
          organizer_id?: string | null
          price?: number | null
          qr_code_url?: string | null
          status?: string
          twitter_url?: string | null
          updated_at?: string | null
          use_logo_as_main_image?: boolean | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          capacity?: number | null
          color_scheme?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          date?: string
          description?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          max_attendees?: number | null
          name?: string
          organizer_id?: string | null
          price?: number | null
          qr_code_url?: string | null
          status?: string
          twitter_url?: string | null
          updated_at?: string | null
          use_logo_as_main_image?: boolean | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      galleries: {
        Row: {
          created_at: string
          event_id: string
          id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          event_id: string
          expires_at: string | null
          id: string
          metadata: Json | null
          name: string | null
          plus_one_allowed: boolean | null
          plus_one_used: boolean | null
          rsvp_date: string | null
          rsvp_status: string | null
          sent_at: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          plus_one_allowed?: boolean | null
          plus_one_used?: boolean | null
          rsvp_date?: string | null
          rsvp_status?: string | null
          sent_at?: string | null
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          plus_one_allowed?: boolean | null
          plus_one_used?: boolean | null
          rsvp_date?: string | null
          rsvp_status?: string | null
          sent_at?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          event_id: string | null
          filename: string
          height: number | null
          id: string
          is_approved: boolean | null
          is_public: boolean | null
          media_type: string
          metadata: Json | null
          mime_type: string | null
          size: number | null
          status: string
          storage_path: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          event_id?: string | null
          filename: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          is_public?: boolean | null
          media_type: string
          metadata?: Json | null
          mime_type?: string | null
          size?: number | null
          status?: string
          storage_path: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          event_id?: string | null
          filename?: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          is_public?: boolean | null
          media_type?: string
          metadata?: Json | null
          mime_type?: string | null
          size?: number | null
          status?: string
          storage_path?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: string
          created_at: string | null
          event_id: string
          id: string
          media_id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          event_id: string
          id?: string
          media_id: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          event_id?: string
          id?: string
          media_id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          status: string
          subscribed_at: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          filename: string | null
          height: number | null
          id: string
          is_approved: boolean | null
          metadata: Json | null
          mime_type: string | null
          size: number | null
          status: string
          storage_path: string
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          filename?: string | null
          height?: number | null
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          size?: number | null
          status?: string
          storage_path: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          filename?: string | null
          height?: number | null
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          size?: number | null
          status?: string
          storage_path?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plan_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan_id: string
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          metadata: Json | null
          preferences: Json | null
          role: string
          status: string
          subscription_end_date: string | null
          subscription_status: string
          subscription_tier: string
          trial_expires_at: string | null
          trial_started_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id: string
          last_login?: string | null
          metadata?: Json | null
          preferences?: Json | null
          role?: string
          status?: string
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          metadata?: Json | null
          preferences?: Json | null
          role?: string
          status?: string
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      role_capabilities: {
        Row: {
          capability: string
          created_at: string
          role: string
        }
        Insert: {
          capability: string
          created_at?: string
          role: string
        }
        Update: {
          capability?: string
          created_at?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_capabilities_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          name?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          auto_lock_session: boolean
          created_at: string | null
          enable_two_factor: boolean
          id: string
          login_notifications: boolean
          session_timeout: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_lock_session?: boolean
          created_at?: string | null
          enable_two_factor?: boolean
          id?: string
          login_notifications?: boolean
          session_timeout?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_lock_session?: boolean
          created_at?: string | null
          enable_two_factor?: boolean
          id?: string
          login_notifications?: boolean
          session_timeout?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      template_configurations: {
        Row: {
          active: boolean | null
          body: string
          created_at: string | null
          html_content: string | null
          id: string
          last_updated: string | null
          name: string
          subject: string | null
          synced_with_auth: boolean | null
          template_id: string
          type: string
        }
        Insert: {
          active?: boolean | null
          body: string
          created_at?: string | null
          html_content?: string | null
          id?: string
          last_updated?: string | null
          name: string
          subject?: string | null
          synced_with_auth?: boolean | null
          template_id: string
          type: string
        }
        Update: {
          active?: boolean | null
          body?: string
          created_at?: string | null
          html_content?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          subject?: string | null
          synced_with_auth?: boolean | null
          template_id?: string
          type?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_invitation_eligibility: {
        Args: {
          p_event_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      end_all_other_user_sessions:
        | {
            Args: {
              p_user_id: string
              p_current_session_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              user_id_param: string
              current_session_id_param: string
            }
            Returns: number
          }
      end_user_session:
        | {
            Args: {
              p_user_id: string
              p_session_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              session_id_param: string
            }
            Returns: boolean
          }
      get_events_by_month:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              month: string
              count: number
            }[]
          }
        | {
            Args: {
              month_param: number
              year_param: number
            }
            Returns: {
              id: string
              name: string
              date: string
              status: string
            }[]
          }
      get_or_create_event_customization:
        | {
            Args: {
              event_id_param: string
            }
            Returns: {
              id: string
              event_id: string
              theme: Json
              created_at: string
              updated_at: string
            }[]
          }
        | {
            Args: {
              p_user_id: string
              p_event_id?: string
            }
            Returns: {
              accent_color: string
              allow_guest_chat: boolean
              auto_post_to_facebook: boolean
              auto_post_to_instagram: boolean
              auto_post_to_twitter: boolean
              chat_welcome_message: string | null
              created_at: string | null
              enable_live_chat: boolean
              enable_social_sharing: boolean
              event_description: string | null
              event_id: string | null
              event_logo: string | null
              event_name: string | null
              gallery_layout: string
              id: string
              moderate_chat: boolean
              photo_display_duration: number
              primary_color: string
              secondary_color: string
              show_photo_info: boolean
              social_sharing_message: string | null
              thumbnail_size: string
              updated_at: string | null
              user_id: string
            }[]
          }
      get_or_create_security_settings: {
        Args: {
          user_id_param: string
        }
        Returns: {
          id: string
          user_id: string
          enable_two_factor: boolean
          auto_lock_session: boolean
          session_timeout: string
          login_notifications: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_recent_activity: {
        Args: {
          limit_count?: number
        }
        Returns: {
          activity_type: string
          activity_id: string
          activity_title: string
          activity_status: string
          created_at: string
        }[]
      }
      get_registrations_by_status:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              status: string
              count: number
            }[]
          }
        | {
            Args: {
              status_param: string
            }
            Returns: {
              id: string
              event_id: string
              user_id: string
              status: string
              created_at: string
            }[]
          }
      get_submissions_by_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
          count: number
        }[]
      }
      get_subscribers_by_status:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              status: string
              count: number
            }[]
          }
        | {
            Args: {
              status_param: string
            }
            Returns: {
              id: string
              email: string
              name: string
              status: string
              subscribed_at: string
              created_at: string
            }[]
          }
      get_subscriptions_by_status:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              status: string
              count: number
            }[]
          }
        | {
            Args: {
              status_param: string
            }
            Returns: {
              id: string
              user_id: string
              plan_id: string
              status: string
              created_at: string
            }[]
          }
      get_users_by_role:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              role: string
              count: number
            }[]
          }
        | {
            Args: {
              role_param: string
            }
            Returns: {
              id: string
              email: string
              role: string
            }[]
          }
      register_user_session:
        | {
            Args: {
              p_user_id: string
              p_session_id: string
              p_device_info: Json
              p_ip_address: string
            }
            Returns: {
              created_at: string | null
              device_info: Json
              id: string
              ip_address: string | null
              is_current: boolean | null
              last_active: string | null
              session_id: string
              user_id: string
            }[]
          }
        | {
            Args: {
              user_id_param: string
              device_info_param: Json
            }
            Returns: string
          }
      update_session_last_active: {
        Args: {
          session_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
