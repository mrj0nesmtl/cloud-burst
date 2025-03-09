import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Panel - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 flex-col bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white relative">
        <div className="mb-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <img 
              src="/cloud-lightning.svg" 
              alt="Cloud Burst Logo" 
              width="24" 
              height="24" 
            />
            Cloud Burst
          </h1>
        </div>
        
        <div>
          <blockquote className="mb-4">
            <p className="text-lg leading-relaxed">
              "Capture moments, create memories, and share experiences with Cloud Burst - your AI-powered event photography platform."
            </p>
            <footer className="mt-2 text-sm">
              Cloud Burst Team
            </footer>
          </blockquote>
        </div>
      </div>
      
      {/* Right Panel - full width on mobile, half width on desktop */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-background">
        <div className="max-w-[400px] w-full">
          {children}
          
          <p className="text-center text-sm mt-6 text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link 
              href="/legal/terms" 
              className="underline underline-offset-4 text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              href="/legal/privacy" 
              className="underline underline-offset-4 text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}