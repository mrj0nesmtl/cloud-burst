import { Session } from '@supabase/supabase-js'
import * as z from 'zod'

// Align with Database types
export const UserRole = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'EVENT_HOST',
  'USER',
  'GUEST'
]).transform(val => val.toLowerCase() as Lowercase<typeof val>)

export type UserRole = z.infer<typeof UserRole>

// Add Capability enum
export const Capability = z.enum([
  'manage:all',
  'manage:roles',
  'manage:users',
  'manage:events',
  'view:analytics',
  'create:events',
  'manage:own_events',
  'invite:guests',
  'view:event_analytics',
  'view:events',
  'upload:photos',
  'manage:own_profile',
  'view:event_photos',
  'upload:event_photos'
])

export type Capability = z.infer<typeof Capability>

// Base validation schemas
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .min(5, "Email is too short")
  .max(255, "Email is too long")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must include uppercase, lowercase, number and special character"
  )

// Auth schemas
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Profile schema aligned with Database type
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50).nullable(),
  email: emailSchema,
  role: UserRole,
  full_name: z.string().min(2).max(100).nullable(),
  avatar_url: z.string().url().nullable(),
  updated_at: z.string().datetime(),
})

// Role schema
export const roleSchema = z.object({
  name: UserRole,
  description: z.string(),
  created_at: z.string().datetime(),
})

// Role capability schema
export const roleCapabilitySchema = z.object({
  role: UserRole,
  capability: Capability,
  created_at: z.string().datetime(),
})

// Auth State Schema
export const authStateSchema = z.object({
  user: userProfileSchema.nullable(),
  session: z.custom<Session>().nullable(),
  loading: z.boolean(),
  capabilities: z.array(Capability),
})

// Types
export type AuthForm = z.infer<typeof authSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type AuthState = z.infer<typeof authStateSchema>
export type Role = z.infer<typeof roleSchema>
export type RoleCapability = z.infer<typeof roleCapabilitySchema>

// Role capabilities
export const roleCapabilities: Record<Lowercase<UserRole>, string[]> = {
  super_admin: [
    'manage:all',
    'manage:roles',
    'manage:users',
    'manage:events',
    'view:analytics'
  ],
  admin: [
    'manage:users',
    'manage:events',
    'view:analytics'
  ],
  event_host: [
    'create:events',
    'manage:own_events',
    'invite:guests',
    'view:event_analytics'
  ],
  user: [
    'view:events',
    'upload:photos',
    'manage:own_profile'
  ],
  guest: [
    'view:event_photos',
    'upload:event_photos'
  ]
} 