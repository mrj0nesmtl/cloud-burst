'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

// Form schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface MagicLinkAuthProps {
  invitationToken?: string
  redirectUrl?: string
  title?: string
  description?: string
}

export function MagicLinkAuth({
  invitationToken,
  redirectUrl = window.location.href,
  title = 'Secure Access',
  description = 'Enter your email to receive a secure magic link'
}: MagicLinkAuthProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          invitationToken,
          redirectUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send magic link')
        return
      }

      setIsSuccess(true)
      toast({
        title: "Magic link sent!",
        description: "Check your email for a secure login link",
        variant: "success",
      })
    } catch (err) {
      console.error('Error sending magic link:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center my-6">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <Alert>
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                We've sent a magic link to your email address. Click the link to securely sign in.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Can't find the email? Check your spam folder or try again.
            </p>
          </div>
        ) : (
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
                        placeholder="you@example.com" 
                        {...field} 
                        type="email"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll send you a secure magic link to access your invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground text-center">
          We'll never share your email with anyone else.
        </p>
      </CardFooter>
    </Card>
  )
} 