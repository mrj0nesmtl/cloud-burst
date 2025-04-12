import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CameraIcon, ImageIcon, HomeIcon } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container max-w-7xl flex justify-between items-center">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <CameraIcon className="h-6 w-6" />
            <span>Cloud Burst</span>
          </Link>
          <nav>
            <ul className="flex gap-4">
              <li>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/guest/dashboard" className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/guest/photos" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Photos</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="py-6 bg-muted">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Cloud Burst. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 