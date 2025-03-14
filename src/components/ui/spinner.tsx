import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/**
 * Spinner component for loading states
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-muted border-t-primary",
        size === 'sm' && "h-4 w-4",
        size === 'md' && "h-8 w-8",
        size === 'lg' && "h-12 w-12",
        size === 'xl' && "h-16 w-16",
        className
      )}
    />
  )
} 