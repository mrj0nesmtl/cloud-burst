import { Session } from '@supabase/supabase-js'
import * as z from 'zod'

// Update UserRole to match middleware roles
export const UserRole = z.enum(['SUPER_ADMIN', 'ADMIN', 'EVENT_HOST', 'USER', 'GUEST'], {
  description: 'User role determines access level and permissions',
})

export type UserRole = z.infer<typeof UserRole>

// Base validation schemas
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .min(5, "Email is too short")
  .max(255, "Email is too long")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters") // bcrypt limit
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must include uppercase, lowercase, number and special character"
  )

// Simplified auth form schemas
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  role: UserRole,
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Auth State Schema
export const authStateSchema = z.object({
  user: userProfileSchema.nullable(),
  session: z.custom<Session>().nullable(),
  loading: z.boolean(),
  capabilities: z.array(z.string()),
})

// Type Exports
export type AuthForm = z.infer<typeof authSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type AuthState = z.infer<typeof authStateSchema>

// Role-based Capabilities aligned with middleware
export const roleCapabilities: Record<z.infer<typeof UserRole>, string[]> = {
  SUPER_ADMIN: [
    'manage:all',
    'manage:users',
    'manage:content',
    'manage:settings',
    'view:analytics'
  ],
  ADMIN: [
    'manage:content',
    'manage:users',
    'view:analytics'
  ],
  EVENT_HOST: [
    'manage:events',
    'manage:photos',
    'view:analytics'
  ],
  USER: [
    'view:content',
    'upload:photos',
    'manage:profile'
  ],
  GUEST: [
    'view:photos',
    'upload:photos'
  ]
} 