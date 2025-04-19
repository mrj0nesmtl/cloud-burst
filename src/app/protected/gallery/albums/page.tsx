import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, FolderPlus, Layout, Clock } from 'lucide-react'
import { ConsistentGrid } from '@/components/gallery/consistent-grid'

export const metadata: Metadata = {
  title: 'Albums | Gallery | Cloud Burst',
  description: 'Manage your photo albums',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AlbumsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/gallery/albums')

    // This is a placeholder for future albums functionality
    // In the future, you'd query for albums here
    const albums = [] // Placeholder for future implementation
    
    // Empty state for the consistent grid
    const emptyState = (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layout className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Album Feature Coming Soon</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          The ability to create and manage custom albums is under development.
          Check back later for this feature.
        </p>
        <div className="flex items-center justify-center mt-6 p-3 bg-muted rounded-md">
          <Clock className="h-4 w-4 text-muted-foreground mr-2" />
          <p className="text-xs text-muted-foreground">Expected in a future update</p>
        </div>
      </div>
    );
    
    return (
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                Albums
              </CardTitle>
              <CardDescription>
                Organize your photos into custom albums
              </CardDescription>
            </div>
            <Button size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              New Album
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ConsistentGrid emptyState={emptyState}>
            {/* Album items will be mapped here when implemented */}
            {albums.map(album => (
              <div key={album.id}>
                {/* Album card component will go here */}
              </div>
            ))}
          </ConsistentGrid>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error loading albums page:', error)
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Albums</h1>
        <p className="text-muted-foreground">
          There was an error loading the albums page. Please try again later.
        </p>
      </div>
    )
  }
} 