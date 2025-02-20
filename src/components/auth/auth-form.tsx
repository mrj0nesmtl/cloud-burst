'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

type AuthFormData = z.infer<typeof authSchema>

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    try {
      const { error } = mode === 'signin' 
        ? await supabase.auth.signInWithPassword(data)
        : await supabase.auth.signUp(data)

      if (error) throw error

      toast({
        title: mode === 'signin' ? 'Signed in successfully' : 'Account created',
        description: mode === 'signin' 
          ? 'Welcome back!'
          : 'Please check your email to verify your account.',
      })

      // Redirect after successful auth
      if (mode === 'signin') {
        router.push('/dashboard')
      }
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="Email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            placeholder="Password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            'Loading...'
          ) : mode === 'signin' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
} 