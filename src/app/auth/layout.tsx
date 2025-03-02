import React from 'react'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent } from '@/components/ui/card'
import { AuthDebug } from "@/components/auth/auth-debug"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <Image
            src="/images/pexels-themo1-bg.jpg"
            alt="Authentication background"
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image 
            src="/cloud-lightning.svg" 
            alt="Cloud Burst" 
            width={24} 
            height={24} 
            className="mr-2"
          />
          Cloud Burst
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Capture moments, create memories, and share experiences with Cloud Burst - your AI-powered event photography platform."
            </p>
            <footer className="text-sm">Cloud Burst Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Image 
              src="/cloud-lightning.svg" 
              alt="Cloud Burst" 
              width={40} 
              height={40} 
              className="mx-auto mb-4"
            />
            {children}
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}