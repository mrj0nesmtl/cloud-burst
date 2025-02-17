import { Session } from '@supabase/supabase-js'
import * as z from 'zod'

// User Roles with descriptions
export const UserRole = z.enum(['super_admin', 'admin', 'organizer', 'user'], {
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

// Auth Form Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().default(false),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  full_name: z.string().min(2, "Name is too short").max(100, "Name is too long").optional(),
  terms: z.boolean().refine((val) => val, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type AuthState = z.infer<typeof authStateSchema>

// Role-based Capabilities
export const roleCapabilities: Record<UserRole, string[]> = {
  super_admin: [
    'manage:all',
    'manage:users',
    'manage:content',
    'manage:settings',
    'view:analytics'
  ],
  admin: [
    'manage:content',
    'manage:users',
    'view:analytics'
  ],
  organizer: [
    'manage:events',
    'manage:photos',
    'view:analytics'
  ],
  user: [
    'view:content',
    'upload:photos',
    'manage:profile'
  ]
} 