import { AuthForm } from '@/components/auth/auth-form'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Register - Cloud Burst',
  description: 'Create your Cloud Burst account',
}

export default function Register() {
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
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started with Cloud Burst
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  )
} 