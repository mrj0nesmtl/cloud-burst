import React from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="min-h-screen flex items-center justify-center">
        <React.Suspense fallback={<LoadingSpinner />}>
          {children}
        </React.Suspense>
      </div>
    </ErrorBoundary>
  )
}