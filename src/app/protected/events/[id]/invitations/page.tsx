import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, InfoIcon, SendIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import InvitationForm from './invitation-form'
import InvitationsList from './invitations-list'
import InvitationStats from './invitation-stats'

export const dynamic = 'force-dynamic'

export default async function EventInvitationsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !event) {
    notFound()
  }
  
  // Get invitations for this event
  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })
  
  // Get invitation stats
  const { data: stats } = await supabase.rpc('get_invitation_stats', {
    event_id: params.id
  })

  const invitationStats = {
    total: invitations?.length || 0,
    pending: invitations?.filter(inv => inv.status === 'pending' || inv.status === 'sent').length || 0,
    opened: invitations?.filter(inv => inv.status === 'opened').length || 0,
    accepted: invitations?.filter(inv => inv.status === 'accepted').length || 0,
    declined: invitations?.filter(inv => inv.status === 'declined').length || 0
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/protected/events/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{event.name} Invitations</h1>
          <Badge variant="outline" className="ml-2">
            {invitationStats.total} {invitationStats.total === 1 ? 'Invitation' : 'Invitations'}
          </Badge>
        </div>
        
        <Button className="flex items-center">
          <SendIcon className="h-4 w-4 mr-2" />
          Send Invitations
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                New Invitation
              </CardTitle>
              <CardDescription>
                Send personalized invitations to guests for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationForm eventId={params.id} />
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <InfoIcon className="h-4 w-4 mr-2" />
                Guests will receive an email with a personalized link
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Invitation Dashboard</CardTitle>
              <CardDescription>
                Track and manage your event invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <InvitationStats stats={invitationStats} />
              
              <Separator />
              
              <Tabs defaultValue="all">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="opened">Opened</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                    <TabsTrigger value="declined">Declined</TabsTrigger>
                  </TabsList>
                  
                  <div className="relative">
                    <Input 
                      placeholder="Search by name or email..." 
                      className="w-64"
                    />
                  </div>
                </div>
                
                <TabsContent value="all">
                  <InvitationsList invitations={invitations || []} />
                </TabsContent>
                <TabsContent value="pending">
                  <InvitationsList invitations={invitations?.filter(inv => inv.status === 'pending' || inv.status === 'sent') || []} />
                </TabsContent>
                <TabsContent value="opened">
                  <InvitationsList invitations={invitations?.filter(inv => inv.status === 'opened') || []} />
                </TabsContent>
                <TabsContent value="accepted">
                  <InvitationsList invitations={invitations?.filter(inv => inv.status === 'accepted') || []} />
                </TabsContent>
                <TabsContent value="declined">
                  <InvitationsList invitations={invitations?.filter(inv => inv.status === 'declined') || []} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <InfoIcon className="h-4 w-4 mr-2" />
                      Pro Tip: Send reminders to guests who haven't responded
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      You can select multiple guests and send them a reminder email.
                      This is especially useful for guests who haven't opened their invitation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 