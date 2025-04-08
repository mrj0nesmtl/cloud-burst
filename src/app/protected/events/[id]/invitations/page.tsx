import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InvitationStats from './invitation-stats'
import InvitationsList from './invitations-list'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Info as InfoIcon, 
  Users as UsersIcon, 
  Send as SendIcon 
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import InvitationForm from './invitation-form'

export default function InvitationsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const eventId = params.id;

  return (
    <div className="w-full max-w-full py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-start mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Link href={`/protected/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Event
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Event Invitations</h1>
        </div>
        
        <Button className="w-full sm:w-auto mt-2 sm:mt-0">
          <SendIcon className="h-4 w-4 mr-2" />
          Send Invitations
        </Button>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="w-full lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <Card className="h-full">
            <CardHeader className="bg-primary/5 border-b p-4 sm:p-6">
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-primary" />
                New Invitation
              </CardTitle>
              <CardDescription>
                Send personalized invitations to guests for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <InvitationForm eventId={params.id} />
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex items-center justify-center p-3 sm:p-4">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <InfoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span>Guests will receive an email with a personalized link</span>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="p-3 sm:p-4 bg-secondary/10">
            <div className="flex items-start gap-2 sm:gap-3">
              <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm">Pro Tip: Send reminders</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Increase your response rate by sending reminders to guests who haven't responded yet
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="w-full lg:col-span-8 order-1 lg:order-2">
          <Card className="h-full">
            <CardHeader className="bg-primary/5 border-b p-4 sm:p-6">
              <CardTitle>Invitation Dashboard</CardTitle>
              <CardDescription>
                Track and manage your event invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <InvitationStats eventId={eventId} />
              
              <Separator className="my-4 sm:my-6" />
              
              <Tabs defaultValue="all">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <TabsList className="w-full sm:w-auto h-auto p-1 self-start">
                    <TabsTrigger value="all" className="text-xs sm:text-sm py-1.5">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs sm:text-sm py-1.5">Pending</TabsTrigger>
                    <TabsTrigger value="accepted" className="text-xs sm:text-sm py-1.5">Accepted</TabsTrigger>
                    <TabsTrigger value="declined" className="text-xs sm:text-sm py-1.5">Declined</TabsTrigger>
                  </TabsList>
                  
                  <div className="relative w-full sm:w-auto">
                    <Input 
                      placeholder="Search by name or email..." 
                      className="w-full sm:w-60 h-9 text-sm"
                    />
                  </div>
                </div>
                
                <TabsContent value="all">
                  <InvitationsList eventId={eventId} filter="all" />
                </TabsContent>
                <TabsContent value="pending">
                  <InvitationsList eventId={eventId} filter="pending" />
                </TabsContent>
                <TabsContent value="accepted">
                  <InvitationsList eventId={eventId} filter="accepted" />
                </TabsContent>
                <TabsContent value="declined">
                  <InvitationsList eventId={eventId} filter="declined" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 