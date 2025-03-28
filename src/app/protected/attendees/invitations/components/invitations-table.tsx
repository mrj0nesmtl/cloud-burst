'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '../columns'
import type { InvitationWithEvent } from '@/types/invitations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface InvitationsTableProps {
  invitations: InvitationWithEvent[]
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter invitations based on search query
  const filteredInvitations = invitations.filter(invitation => 
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invitation.name && invitation.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (invitation.event.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg">Invitations</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          View and manage all your event invitations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {/* Mobile-optimized search box */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Mobile list view for small screens */}
        <div className="block md:hidden">
          {filteredInvitations.length > 0 ? (
            <div className="space-y-3">
              {filteredInvitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="border rounded-md p-3 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{invitation.email}</p>
                      {invitation.name && (
                        <p className="text-xs text-muted-foreground">{invitation.name}</p>
                      )}
                    </div>
                    <div className="text-xs bg-muted py-0.5 px-1.5 rounded">
                      {invitation.status}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-xs">
                      <p className="font-medium">{invitation.event.name}</p>
                      <p className="text-muted-foreground">
                        {new Date(invitation.event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      Actions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No invitations found
            </div>
          )}
        </div>
        
        {/* Desktop table view for larger screens */}
        <div className="hidden md:block">
          <DataTable 
            columns={columns} 
            data={filteredInvitations}
            searchKey="email"
            searchPlaceholder="Search by email..."
          />
        </div>
      </CardContent>
    </Card>
  )
} 