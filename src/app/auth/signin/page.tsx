import { AuthForm } from '@/components/auth/auth-form'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sign In - Cloud Burst',
  description: 'Sign in to your Cloud Burst account',
}

export default function SignIn() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <Image 
          src="/cloud-lightning.svg" 
          alt="Cloud Burst" 
          width={40} 
          height={40} 
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <AuthForm mode="signin" />
    </div>
  )
} 