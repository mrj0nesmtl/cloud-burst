'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Make this component client-side to use usePathname
  const pathname = usePathname();
  
  // Determine which video to show based on the path
  const videoSrc = pathname?.includes('/auth/signin')
    ? '/cb_002_sora_ai.mp4'
    : '/cb_003_sora_ai.MP4';

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Panel - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 flex-col bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white relative">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Content overlaid on video */}
        <div className="relative z-10">
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
        
        {/* Quote positioned in the middle of the panel instead of at the bottom */}
        <div className="relative z-10 flex-grow flex flex-col justify-center my-12">
          <blockquote className="mb-4">
            <p className="text-2xl font-bold leading-relaxed">
              "Capture Every Moment!"
            </p>
            <footer className="mt-2 text-sm">
              Cloud Burst Team
            </footer>
          </blockquote>
        </div>
        
        {/* Empty div to push content up */}
        <div className="relative z-10 flex-grow"></div>
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