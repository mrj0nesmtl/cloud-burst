'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UseMagicLinkOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useMagicLink(options: UseMagicLinkOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const sendMagicLink = async ({
    email,
    invitationToken,
    redirectUrl = window.location.href
  }: {
    email: string
    invitationToken?: string
    redirectUrl?: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          invitationToken,
          redirectUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link')
      }

      setIsSuccess(true)
      toast({
        title: "Magic link sent!",
        description: "Check your email for a secure login link",
        variant: "success",
      })

      if (options.onSuccess) {
        options.onSuccess()
      }

      return { success: true }
    } catch (err) {
      console.error('Error sending magic link:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      if (options.onError) {
        options.onError(errorMessage)
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendMagicLink,
    isLoading,
    isSuccess,
    error,
    reset: () => {
      setIsSuccess(false)
      setError(null)
    }
  }
} 