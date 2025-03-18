'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Mail, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { InvitationWithEvent } from '@/types/invitations'

export const columns: ColumnDef<InvitationWithEvent>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email: string = row.getValue('email')
      return <div className="font-medium">{email}</div>
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name: string | null = row.getValue('name')
      return <div>{name || '-'}</div>
    },
  },
  {
    accessorKey: 'event',
    header: 'Event',
    cell: ({ row }) => {
      const event = row.original.event
      return (
        <div className="flex flex-col">
          <span className="font-medium">{event.name}</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(event.date)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: string = row.getValue('status')
      return (
        <Badge variant={
          status === 'sent' ? 'default' :
          status === 'accepted' ? 'success' :
          status === 'declined' ? 'destructive' :
          status === 'expired' ? 'outline' :
          'secondary'
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'rsvp_status',
    header: 'RSVP',
    cell: ({ row }) => {
      const status: string = row.getValue('rsvp_status')
      return (
        <Badge variant={
          status === 'yes' ? 'success' :
          status === 'no' ? 'destructive' :
          status === 'maybe' ? 'warning' :
          'secondary'
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invitation = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invitation.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={`/protected/attendees/invitations/${invitation.id}`}
                className="flex w-full items-center"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/protected/attendees/invitations/${invitation.id}/resend`}
                className="flex w-full items-center"
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend invitation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 