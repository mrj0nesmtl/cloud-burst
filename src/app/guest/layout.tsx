import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CameraIcon, ImageIcon, HomeIcon } from 'lucide-react'
import Image from 'next/image'
import { GuestHeader } from '@/components/layout/guest-header'
import { TokenProvider } from '@/contexts/token-context'

export const metadata: Metadata = {
  title: 'Guest Portal | Cloud Burst',
  description: 'Share and view photos from your events',
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <GuestHeader />
      <main className="flex-1 bg-background">
        <TokenProvider>
          {children}
        </TokenProvider>
      </main>
    </div>
  )
} 