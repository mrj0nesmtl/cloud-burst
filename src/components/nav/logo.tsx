import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/protected/dashboard" className={cn("flex items-center", className)}>
      <span className="font-bold text-xl">Cloud Burst</span>
    </Link>
  )
} 