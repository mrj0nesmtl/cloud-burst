import { AuthForm } from '@/components/auth/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Cloud Burst',
  description: 'Sign in to your Cloud Burst account',
}

export default function SignIn() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your email to sign in to your account
      </p>
      <AuthForm mode="signin" />
    </>
  )
} 