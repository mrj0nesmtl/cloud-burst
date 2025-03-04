"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="space-y-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline" className="ml-4">
          <a href="/">Go back home</a>
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-muted rounded-md text-left w-full max-w-2xl overflow-auto">
          <p className="font-mono text-sm mb-2">Error details:</p>
          <pre className="text-xs text-red-500 whitespace-pre-wrap break-all">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  )
} 