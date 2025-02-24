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
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type AuthFormData = z.infer<typeof authSchema>

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  async function onSubmit(data: AuthFormData) {
    setIsLoading(true)
    try {
      const { error } = mode === 'signin' 
        ? await supabase.auth.signInWithPassword(data)
        : await supabase.auth.signUp(data)

      if (error) throw error

      if (mode === 'signin') {
        router.push('/dashboard')
        toast({
          title: 'Welcome back!'
        })
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a verification link.'
        })
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
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...form.register('email')}
          type="email"
          placeholder="Email"
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
        
        <Input
          {...form.register('password')}
          type="password"
          placeholder="Password"
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>

      <div className="text-center text-sm">
        {mode === 'signin' ? (
          <Link href="/auth/register" className="text-primary hover:underline">
            Create account
          </Link>
        ) : (
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </div>
  )
} 