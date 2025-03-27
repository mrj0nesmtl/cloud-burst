import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { FileIcon, ImageIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'All Media | Gallery | Cloud Burst',
  description: 'View all media across your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function AllMediaRedirect() {
  redirect('/protected/gallery')
} 