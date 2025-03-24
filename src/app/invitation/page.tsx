'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { Eye, EyeOff, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

enum InvitationState {
  LOADING = 'loading',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  VALID = 'valid',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

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
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Cloud Burst"
          width={160}
          height={40}
          priority
        />
      </div>
      
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
} 