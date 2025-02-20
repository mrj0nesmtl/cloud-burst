'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  className?: string
  resetKeys?: any[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call onError prop if provided
    this.props.onError?.(error, errorInfo)
    
    // Update state with error info
    this.setState({ errorInfo })
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )
      if (hasKeyChanged) {
        this.handleReset()
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, className } = this.props

    if (hasError) {
      if (fallback) return fallback

      return (
        <div className={cn(
          "flex h-[50vh] flex-col items-center justify-center gap-4",
          className
        )}>
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={this.handleReset}
              variant="default"
            >
              Try again
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Reload page
            </Button>
          </div>
        </div>
      )
    }

    return children
  }
}

// Convenience HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
} 