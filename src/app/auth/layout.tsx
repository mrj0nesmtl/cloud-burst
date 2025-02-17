import React from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent } from '@/components/ui/card'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <React.Suspense fallback={<LoadingSpinner />}>
              {children}
            </React.Suspense>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}