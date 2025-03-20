import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GalleryTabs } from '@/components/gallery/gallery-tabs'

export const metadata: Metadata = {
  title: 'Gallery | Cloud Burst',
  description: 'Manage your event media, galleries, and albums',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface GalleryLayoutProps {
  children: React.ReactNode
}

export default async function GalleryLayout({ children }: GalleryLayoutProps) {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/gallery/all')

    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-muted-foreground">
              Manage your event media, galleries and albums
            </p>
          </div>
          
          <div style={{ marginTop: '24px' }} className="flex flex-wrap items-center gap-2">
            <GalleryTabs />
          </div>
        </div>

        {children}
      </div>
    )
  } catch (error) {
    console.error('Error in gallery layout:', error)
    redirect('/auth/signin')
  }
} 