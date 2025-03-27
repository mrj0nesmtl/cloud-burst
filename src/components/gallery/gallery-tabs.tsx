'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function GalleryTabs() {
  const pathname = usePathname()
  const activeTab = pathname.split('/').pop() || ''
  
  // Special case for the root gallery path
  const isRoot = pathname === '/protected/gallery'
  const effectiveTab = isRoot ? 'all' : activeTab

  return (
    <Tabs defaultValue={effectiveTab} className="w-full">
      <TabsList>
        <Link href="/protected/gallery" passHref>
          <TabsTrigger
            value="all"
            asChild
          >
            <div>All Media</div>
          </TabsTrigger>
        </Link>
        <Link href="/protected/gallery/events" passHref>
          <TabsTrigger
            value="events"
            asChild
          >
            <div>Events (Galleries)</div>
          </TabsTrigger>
        </Link>
        <Link href="/protected/gallery/moderate" passHref>
          <TabsTrigger
            value="moderate"
            asChild
          >
            <div>Moderation</div>
          </TabsTrigger>
        </Link>
        <Link href="/protected/gallery/albums" passHref>
          <TabsTrigger
            value="albums"
            asChild
          >
            <div>Albums</div>
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  )
} 