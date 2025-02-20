import React from 'react'
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
  centered?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label = 'Loading...',
  centered = false
}: SpinnerProps) {
  const sizeClasses = {
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        centered && 'justify-center w-full h-full min-h-[100px]',
        className
      )}
      role="status"
      aria-label={label}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size]
        )} 
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

// Export a centered version for convenience
export function CenteredSpinner(props: Omit<SpinnerProps, 'centered'>) {
  return <LoadingSpinner {...props} centered />
} 