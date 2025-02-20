import React from 'react'
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
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-lg border">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center">Cloud Burst</h1>
          <p className="text-center text-muted-foreground">Event Photography Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}