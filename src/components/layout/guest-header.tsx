"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

export function GuestHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Cloud Burst"
              width={28}
              height={28}
              className="dark:invert"
            />
            <span className="font-semibold inline-block">Cloud Burst</span>
          </Link>
        </div>
        
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 