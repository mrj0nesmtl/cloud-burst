'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mt-2 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Convenience HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
} 