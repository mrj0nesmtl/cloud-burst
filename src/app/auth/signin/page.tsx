import { AuthForm } from '@/components/auth/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Cloud Burst',
  description: 'Sign in to your Cloud Burst account',
}

export default function SignIn() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-center">Welcome back</h2>
        <p className="text-sm text-center text-muted-foreground">
          Sign in to your account
        </p>
      </div>
      <AuthForm mode="signin" />
    </div>
  )
} 