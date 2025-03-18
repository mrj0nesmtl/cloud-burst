'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '../columns'
import type { InvitationWithEvent } from '@/types/invitations'

interface InvitationsTableProps {
  invitations: InvitationWithEvent[]
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>
          View and manage all your event invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={invitations}
          searchKey="email"
          searchPlaceholder="Search by email..."
        />
      </CardContent>
    </Card>
  )
} 