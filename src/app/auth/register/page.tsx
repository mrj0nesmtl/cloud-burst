import { AuthForm } from '@/components/auth/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Cloud Burst',
  description: 'Create your Cloud Burst account',
}

export default function Register() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-center">Create an account</h2>
        <p className="text-sm text-center text-muted-foreground">
          Get started with Cloud Burst
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  )
} 