"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CameraIcon, ImageIcon, HomeIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function GuestHeader() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const event = searchParams?.get('event')
  
  const getHrefWithParams = (path: string) => {
    if (token) {
      return `${path}?token=${token}`
    }
    if (event) {
      return `${path}?event=${event}`
    }
    return path
  }
  
  return (
    <header className="border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* Removed Cloud Burst title and camera icon */}
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <nav>
            <ul className="flex gap-1">
              <li>
                <Button asChild variant="ghost" size="sm">
                  <Link href={getHrefWithParams('/guest/dashboard')} className="flex items-center gap-1">
                    <HomeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" size="sm">
                  <Link href={getHrefWithParams('/guest/photos')} className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Photos</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 