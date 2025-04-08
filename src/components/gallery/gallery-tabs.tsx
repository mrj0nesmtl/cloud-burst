'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function GalleryTabs() {
  const pathname = usePathname()
  const activeTab = pathname.split('/').pop() || ''
  
  // Special case for the root gallery path
  const isRoot = pathname === '/protected/gallery'
  const effectiveTab = isRoot ? 'all' : activeTab

  return (
    <div className="w-full border rounded-lg bg-card overflow-hidden">
      <Tabs defaultValue={effectiveTab} className="w-full">
        <TabsList 
          className="w-full rounded-none bg-card border-b p-0 overflow-x-auto flex whitespace-nowrap scrollbar-none"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <Link href="/protected/gallery" passHref className="flex-1 min-w-[80px]">
            <TabsTrigger
              value="all"
              asChild
              className="rounded-none py-2 md:py-3 w-full text-xs md:text-sm data-[state=active]:bg-muted data-[state=active]:shadow-none border-r last:border-r-0"
            >
              <div>All Media</div>
            </TabsTrigger>
          </Link>
          <Link href="/protected/gallery/events" passHref className="flex-1 min-w-[80px]">
            <TabsTrigger
              value="events"
              asChild
              className="rounded-none py-2 md:py-3 w-full text-xs md:text-sm data-[state=active]:bg-muted data-[state=active]:shadow-none border-r last:border-r-0"
            >
              <div>Events Galleries</div>
            </TabsTrigger>
          </Link>
          <Link href="/protected/gallery/moderate" passHref className="flex-1 min-w-[80px]">
            <TabsTrigger
              value="moderate"
              asChild
              className="rounded-none py-2 md:py-3 w-full text-xs md:text-sm data-[state=active]:bg-muted data-[state=active]:shadow-none border-r last:border-r-0"
            >
              <div>Moderation</div>
            </TabsTrigger>
          </Link>
          <Link href="/protected/gallery/albums" passHref className="flex-1 min-w-[80px]">
            <TabsTrigger
              value="albums"
              asChild
              className="rounded-none py-2 md:py-3 w-full text-xs md:text-sm data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              <div>Albums</div>
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  )
} 