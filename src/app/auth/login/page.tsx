import { Metadata } from "next"
import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"
import { CloudLightning } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign In | Cloud Burst",
  description: "Sign in to your Cloud Burst account",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <CloudLightning className="h-12 w-12 text-blue-500" />
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>

      <AuthForm mode="signin" />

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