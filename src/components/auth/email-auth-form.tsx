"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/lib/supabase/config'
import { useEffect, useState } from 'react'

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type AuthFormData = z.infer<typeof authSchema>

interface EmailAuthFormProps {
  mode: "signin" | "signup"
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  useEffect(() => {
    // Initialize Supabase client only on the client side
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        // Don't log the full key, just the first few characters
        console.log('ANON KEY (first 8 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 8))
        
        const { data, error } = await supabase.from('user_profiles').select('*', { count: 'exact' })
        
        if (error) {
          console.error('Connection test error:', error)
        } else {
          console.log('Connection successful:', data)
        }
      } catch (err) {
        console.error('Connection test failed:', err)
      }
    }

    testConnection()
  }, [])

  const onSubmit = async (data: AuthFormData) => {
    if (!supabase) return
    
    setIsLoading(true)
    try {
      console.log('Starting auth attempt...', {
        email: data.email,
        timestamp: new Date().toISOString()
      })

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('Detailed auth error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        })
        throw error
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      toast({
        title: "Success",
        description: "Signed in successfully"
      })

      // Redirect based on role
      window.location.href = profile.role === 'super_admin' 
        ? '/protected/admin'
        : '/protected/dashboard'

    } catch (error: any) {
      console.error('Auth error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
} 