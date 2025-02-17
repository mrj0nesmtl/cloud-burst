import { Metadata } from "next"
import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"
import { CloudLightning } from "lucide-react"
import { EmailAuthForm } from "@/components/auth/email-auth-form"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Sign In | Cloud Burst",
  description: "Sign in to your Cloud Burst account",
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>
      
      <EmailAuthForm mode="signin" />
      
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

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          href="/auth/register" 
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Create account
        </Link>
      </p>
    </div>
  )
} 