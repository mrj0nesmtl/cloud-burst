'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/lib/auth/auth-store"
import type { LoginForm, RegisterForm } from "@/types/auth"
import { loginSchema, registerSchema } from "@/types/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SocialAuthButtons } from "./social-auth-buttons"

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp, isLoading, error, clearError } = useAuthStore()
  
  const form = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(mode === 'signin' ? loginSchema : registerSchema),
    defaultValues: mode === 'signin' 
      ? {
          email: "",
          password: "",
          remember: false
        } as LoginForm
      : {
          email: "",
          password: "",
          confirmPassword: "",
          terms: false,
          full_name: ""
        } as RegisterForm,
  })

  async function onSubmit(data: LoginForm | RegisterForm) {
    clearError()
    if (mode === 'signin' && 'remember' in data) {
      await signIn(data.email, data.password)
    } else if (mode === 'signup' && 'terms' in data) {
      await signUp(data.email, data.password)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    {...field} 
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
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'signup' && (
            <>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none">
                      I accept the terms and conditions
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {mode === 'signin' && (
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium leading-none">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                {mode === 'signin' ? 'Signing in...' : 'Signing up...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Sign Up'
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

      <SocialAuthButtons />

      <div className="text-center text-sm">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <a href="/auth/register" className="text-primary hover:underline">
              Create one
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  )
} 