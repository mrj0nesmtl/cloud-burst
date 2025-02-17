"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth/auth-store"
import { Provider } from "@supabase/supabase-js"
import { FcGoogle } from "react-icons/fc"
import { useToast } from "@/hooks/use-toast"

// Only include Google provider
type SupportedProvider = Extract<Provider, 'google'>

interface SocialButtonProps {
  provider: SupportedProvider
  isLoading: boolean
  onClick: (provider: SupportedProvider) => Promise<void>
}

const providerConfig: Record<SupportedProvider, {
  icon: React.ReactNode
  label: string
  className?: string
}> = {
  google: {
    icon: <FcGoogle className="mr-2 h-4 w-4" />,
    label: "Continue with Google",
    className: "hover:bg-[#4285f4] hover:text-white"
  }
}

function SocialAuthButton({ provider, isLoading, onClick }: SocialButtonProps) {
  const config = providerConfig[provider]

  return (
    <Button 
      variant="outline" 
      onClick={() => onClick(provider)}
      disabled={isLoading}
      className={`w-full transition-colors duration-200 ${config.className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          {config.icon}
          {config.label}
        </>
      )}
    </Button>
  )
}

export function SocialAuthButtons() {
  const { signInWithSocial, isLoading } = useAuthStore()
  const { toast } = useToast()

  const handleSocialSignIn = async (provider: SupportedProvider) => {
    try {
      await signInWithSocial(provider)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || 'An error occurred during sign in'
      })
      console.error(`Error signing in with ${provider}:`, error)
    }
  }

  return (
    <div className="grid gap-2">
      <SocialAuthButton 
        provider="google"
        isLoading={isLoading}
        onClick={handleSocialSignIn}
      />
    </div>
  )
} 