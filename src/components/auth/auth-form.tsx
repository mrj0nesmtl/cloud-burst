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
  const searchParams = useSearchParams()
  
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
      const authResponse = mode === 'signin' 
        ? await supabase.auth.signInWithPassword(data)
        : await supabase.auth.signUp(data)

      if (authResponse.error) throw authResponse.error

      if (mode === 'signin') {
        const returnTo = searchParams.get('returnTo') || '/protected/dashboard'
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = returnTo
        
        toast({
          title: 'Welcome back!',
          duration: 5000
        })
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a verification link.',
          duration: 5000
        })
      }
    } catch (error: any) {
      console.error('Auth error:', error.message)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    className={cn(
                      "w-full",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={cn(
                      "w-full",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Loading...</>
            ) : mode === 'signin' ? (
              <>Sign In</>
            ) : (
              <>Create Account</>
            )}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Button variant="outline" type="button" disabled={isLoading}>
          <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Google
        </Button>
      </div>
      <div className="text-center text-sm">
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