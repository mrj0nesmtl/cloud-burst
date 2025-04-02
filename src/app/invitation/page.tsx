'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { Eye, EyeOff, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, QrCode, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'

enum InvitationState {
  LOADING = 'loading',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  VALID = 'valid',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

// Validation schema for the invitation token
const tokenSchema = z.object({
  token: z.string().min(6, {
    message: 'Invitation code must be at least 6 characters',
  }).max(100),
})

// Validation schema for the email
const emailSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
})

export default function InvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [invitationState, setInvitationState] = useState<InvitationState>(InvitationState.LOADING)
  const [eventId, setEventId] = useState<string | null>(null)
  const [eventName, setEventName] = useState<string | null>(null)
  const [loginLink, setLoginLink] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form for token input
  const tokenForm = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: '',
    },
  })
  
  // Form for email input
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })
  
  // Validate the invitation token
  useEffect(() => {
    async function validateInvitation() {
      if (!token) {
        setInvitationState(InvitationState.INVALID)
        return
      }
      
      try {
        const response = await fetch(`/api/invitations/validate?token=${token}`)
        
        if (!response.ok) {
          if (response.status === 410) {
            setInvitationState(InvitationState.EXPIRED)
          } else {
            setInvitationState(InvitationState.INVALID)
          }
          return
        }
        
        const data = await response.json()
        
        if (data.success) {
          setEventId(data.eventId)
          setLoginLink(data.loginLink)
          setIsNewUser(data.isNewUser)
          
          // Get event details
          if (data.eventId) {
            const { data: eventData } = await supabase
              .from('events')
              .select('name')
              .eq('id', data.eventId)
              .single()
              
            if (eventData) {
              setEventName(eventData.name)
            }
          }
          
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setInvitationState(InvitationState.AUTHENTICATED)
          } else {
            setInvitationState(InvitationState.VALID)
          }
        } else {
          setInvitationState(InvitationState.ERROR)
        }
      } catch (error) {
        console.error('Error validating invitation:', error)
        setInvitationState(InvitationState.ERROR)
      }
    }
    
    validateInvitation()
  }, [token, supabase])
  
  // Handle login with magic link
  const handleMagicLinkLogin = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      })
      return
    }
    
    setIsLoggingIn(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + (eventId ? `/events/${eventId}/gallery` : '/dashboard')
        }
      })
      
      if (error) {
        throw error
      }
      
      toast({
        title: 'Check your email',
        description: 'We\'ve sent you a magic link to sign in',
      })
    } catch (error) {
      console.error('Magic link error:', error)
      toast({
        title: 'Error sending magic link',
        description: 'Could not send login email. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoggingIn(false)
    }
  }
  
  // Handle password login
  const handlePasswordLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'All fields required',
        description: 'Please enter both email and password',
        variant: 'destructive'
      })
      return
    }
    
    setIsLoggingIn(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      // Successful login
      setInvitationState(InvitationState.AUTHENTICATED)
      
      // Redirect to the event gallery
      if (eventId) {
        router.push(`/events/${eventId}/gallery`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive'
      })
      setIsLoggingIn(false)
    }
  }
  
  // Auto-login with magic link if available
  const handleAutoLogin = async () => {
    if (!loginLink) {
      return
    }
    
    try {
      // Extract the token from the magic link
      const url = new URL(loginLink)
      const token = url.searchParams.get('token')
      
      if (!token) {
        throw new Error('Invalid magic link')
      }
      
      setIsLoggingIn(true)
      
      // Verify the OTP token
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink'
      })
      
      if (error) {
        throw error
      }
      
      // Successful login
      setInvitationState(InvitationState.AUTHENTICATED)
      
      toast({
        title: 'Successfully signed in',
        description: 'Redirecting to event gallery...'
      })
      
      // Redirect to the event gallery
      if (eventId) {
        router.push(`/events/${eventId}/gallery`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Auto-login error:', error)
      // If auto-login fails, we'll fall back to manual login
      toast({
        title: 'Automatic login failed',
        description: 'Please sign in manually',
        variant: 'destructive'
      })
      setIsLoggingIn(false)
    }
  }
  
  // Handle token form submission
  const onTokenSubmit = (values: z.infer<typeof tokenSchema>) => {
    setIsSubmitting(true)
    
    // Validate the token format
    if (!/^[a-zA-Z0-9_-]+$/.test(values.token)) {
      toast({
        title: 'Invalid token format',
        description: 'The invitation code contains invalid characters',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }
    
    // Redirect to the invitation page
    router.push(`/invitation/${values.token}`)
  }
  
  // Handle email form submission
  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true)
    
    try {
      // Call API to lookup invitations by email
      const response = await fetch('/api/invitation/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup invitation')
      }
      
      if (!data.invitations || data.invitations.length === 0) {
        toast({
          title: 'No invitations found',
          description: 'We couldn\'t find any invitations for this email address',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }
      
      // If only one invitation, redirect directly
      if (data.invitations.length === 1) {
        router.push(`/invitation/${data.invitations[0].token}`)
        return
      }
      
      // If multiple invitations, provide a selection UI or redirect to a list page
      // For now, redirect to the first one
      router.push(`/invitation/${data.invitations[0].token}`)
      
    } catch (error) {
      console.error('Error looking up invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to lookup invitation. Please try again.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }
  
  // Render based on invitation state
  const renderContent = () => {
    switch (invitationState) {
      case InvitationState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner size="lg" className="mb-4" />
            <p>Validating invitation...</p>
          </div>
        )
        
      case InvitationState.INVALID:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or has been used already.
            </p>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        )
        
      case InvitationState.EXPIRED:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation Expired</h2>
            <p className="text-muted-foreground mb-6">
              This invitation has expired. Please contact the event organizer for a new invitation.
            </p>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        )
        
      case InvitationState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an error while processing your invitation. Please try again or contact support.
            </p>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        )
        
      case InvitationState.AUTHENTICATED:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Successfully Authenticated</h2>
            <p className="text-muted-foreground mb-6">
              You're now signed in. You can proceed to the event gallery.
            </p>
            <Button onClick={() => router.push(eventId ? `/events/${eventId}/gallery` : '/dashboard')}>
              {eventId ? 'View Gallery' : 'Go to Dashboard'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
        
      case InvitationState.VALID:
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold">Invitation Valid</h2>
              {eventName && (
                <p className="text-muted-foreground">
                  You've been invited to <span className="font-medium">{eventName}</span>
                </p>
              )}
            </div>
            
            {loginLink && isNewUser && (
              <div className="mb-6">
                <Button 
                  className="w-full" 
                  onClick={handleAutoLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Spinner className="mr-2" size="sm" />
                      Signing you in...
                    </>
                  ) : (
                    <>
                      Continue as Guest
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or Sign In
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={handlePasswordLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Signing in...
                  </>
                ) : (
                  'Sign In with Password'
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMagicLinkLogin}
                disabled={isLoggingIn}
              >
                <Mail className="mr-2 h-4 w-4" />
                Sign In with Magic Link
              </Button>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <header className="mb-6">
        <Link href="/" className="inline-block mb-4">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Find Your Invitation</h1>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Access Your Invitation</CardTitle>
          <CardDescription>
            Enter your invitation code or use your email address to find your invitation.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Invitation Code</TabsTrigger>
              <TabsTrigger value="email">Email Address</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="mt-4">
              <Form {...tokenForm}>
                <form onSubmit={tokenForm.handleSubmit(onTokenSubmit)} className="space-y-4">
                  <FormField
                    control={tokenForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invitation Code</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input placeholder="Enter your invitation code" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The code from your invitation email or QR code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-background"></div>
                        Checking...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send className="mr-2 h-4 w-4" />
                        View Invitation
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="email" className="mt-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input placeholder="Enter your email address" type="email" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The email address your invitation was sent to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-background"></div>
                        Looking Up...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Find My Invitation
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild className="mt-2">
            <Link href="/scan" className="flex items-center">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Code
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 