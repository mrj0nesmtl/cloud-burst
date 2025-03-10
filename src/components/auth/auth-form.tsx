'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from '@/lib/utils'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Enhanced schema with better error messages
const authSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

type AuthFormData = z.infer<typeof authSchema>

// Track auth attempts to prevent rate limiting
const AUTH_ATTEMPT_KEY = 'auth_attempt_timestamp'
const MIN_AUTH_INTERVAL_MS = 2000 // 2 seconds between attempts

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get error from URL if present
  const errorParam = searchParams.get('error')
  
  // Handle URL error parameters
  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'session_error': 'Authentication session error. Please try again.',
        'profile_error': 'Could not retrieve your profile. Please try again.',
        'profile_not_found': 'Your profile was not found. Please contact support.',
        'rate_limit': 'Too many authentication attempts. Please wait a moment and try again.',
        'unknown': 'An unknown error occurred. Please try again.'
      }
      
      setFormError(errorMessages[errorParam] || 'An error occurred. Please try again.')
    }
  }, [errorParam])
  
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  async function onSubmit(data: AuthFormData) {
    setFormError(null)
    
    // Check if we need to throttle auth attempts
    const lastAttempt = localStorage.getItem(AUTH_ATTEMPT_KEY)
    const now = Date.now()
    
    if (lastAttempt) {
      const timeSinceLastAttempt = now - parseInt(lastAttempt)
      if (timeSinceLastAttempt < MIN_AUTH_INTERVAL_MS) {
        setFormError('Please wait a moment before trying again')
        toast({
          variant: 'destructive',
          title: 'Rate limit protection',
          description: 'Please wait a moment before trying again',
          duration: 3000
        })
        return
      }
    }
    
    // Record this attempt
    localStorage.setItem(AUTH_ATTEMPT_KEY, now.toString())
    
    setIsLoading(true)
    
    try {
      const authResponse = mode === 'signin' 
        ? await supabase.auth.signInWithPassword(data)
        : await supabase.auth.signUp(data)

      if (authResponse.error) {
        // Check for rate limiting errors
        if (authResponse.error.message.includes('rate limit') || 
            authResponse.error.status === 429) {
          throw new Error('Too many authentication attempts. Please wait a moment and try again.')
        }
        throw authResponse.error
      }

      if (mode === 'signin') {
        const returnTo = searchParams.get('returnTo') || '/protected/dashboard'
        
        toast({
          title: 'Welcome back!',
          description: 'Signing you in...',
          duration: 3000
        })
        
        // Short delay to allow toast to be seen
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Use router for client-side navigation
        router.push(returnTo)
      } else {
        toast({
          title: 'Account created',
          description: 'Check your email for a verification link.',
          duration: 5000
        })
        
        // Reset form after successful signup
        form.reset()
      }
    } catch (error: any) {
      console.error('Auth error:', error.message)
      setFormError(error.message)
      toast({
        variant: 'destructive',
        title: 'Authentication error',
        description: error.message || 'Something went wrong',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 bg-card border rounded-lg shadow-sm p-6">
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                    className={cn(
                      "w-full h-11 px-3 bg-background text-foreground border-input focus:ring-2 focus:ring-primary",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className={cn(
                      "w-full h-11 px-3 bg-background text-foreground border-input focus:ring-2 focus:ring-primary",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs font-medium" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading} 
        className="w-full h-11 flex items-center justify-center border-input"
        onClick={() => {
          toast({
            title: "Google Sign In",
            description: "Google authentication is not configured yet.",
            duration: 3000
          })
        }}
      >
        <svg className="mr-2 h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Google
      </Button>
      
      <div className="text-center text-sm mt-6">
        {mode === 'signin' ? (
          <>
            Don't have an account?{" "}
            <Link 
              href="/auth/register" 
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link 
              href="/auth/signin" 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
} 