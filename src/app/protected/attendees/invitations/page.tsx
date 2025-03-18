import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { Shell } from '@/components/shell'
import { InvitationsTable } from './components/invitations-table'
import type { InvitationWithEvent } from '@/types/invitations'

export const metadata: Metadata = {
  title: 'Manage Invitations',
  description: 'Create and manage invitations for your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

async function getInvitations() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select(`
      *,
      event:events (
        id,
        name,
        date,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }

  return invitations as InvitationWithEvent[]
}

export default async function ManageInvitationsPage() {
  const invitations = await getInvitations()

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Manage Invitations</h1>
          <p className="text-muted-foreground">
            Create and manage invitations for your events
          </p>
        </div>
        <Link href="/protected/attendees/invitations/create" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invitation
          </Button>
        </Link>
      </div>

      <Separator className="my-4" />

      <InvitationsTable invitations={invitations} />
    </Shell>
  )
} 