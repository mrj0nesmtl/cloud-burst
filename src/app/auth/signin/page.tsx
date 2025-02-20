import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { EmailAuthForm } from "@/components/auth/email-auth-form"
import { AuthDebugPanel } from '@/components/auth/debug-panel'

export const metadata: Metadata = {
  title: "Sign In | Cloud Burst",
  description: "Sign in to your Cloud Burst account",
}

export default function SignInPage() {
  return (
    <div className="container mx-auto max-w-md space-y-6 p-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/android-chrome-192x192.png"
            alt="Cloud Burst Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      
      <EmailAuthForm mode="signin" />

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          href="/auth/register" 
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Create account
        </Link>
      </p>
      <AuthDebugPanel />
    </div>
  )
} 