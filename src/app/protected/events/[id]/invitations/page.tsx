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
    <div style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden" }} className="py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-start mb-3 sm:mb-6 gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href={`/protected/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Event Invitations</h1>
        </div>
        
        <Button className="w-full sm:w-auto mt-2 sm:mt-0 text-sm h-9">
          <SendIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Send Invitations
        </Button>
      </div>
      
      <div style={{ width: "100%" }} className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-6">
        <div style={{ width: "100%" }} className="lg:col-span-8 order-1 lg:order-2">
          <Card style={{ width: "100%" }}>
            <CardHeader className="bg-primary/5 border-b p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg">Invitation Dashboard</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track and manage your event invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <InvitationStats eventId={eventId} />
              </div>
              
              <Separator className="my-3 sm:my-4 md:my-6" />
              
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <Tabs defaultValue="all">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                    <TabsList className="w-full sm:w-auto h-auto p-1 self-start">
                      <TabsTrigger value="all" className="text-xs py-1.5">All</TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs py-1.5">Pending</TabsTrigger>
                      <TabsTrigger value="accepted" className="text-xs py-1.5">Accepted</TabsTrigger>
                      <TabsTrigger value="declined" className="text-xs py-1.5">Declined</TabsTrigger>
                    </TabsList>
                    
                    <div className="relative w-full sm:w-auto">
                      <Input 
                        placeholder="Search by name or email..." 
                        className="w-full sm:w-56 md:w-60 h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div style={{ width: "100%", overflowX: "hidden" }}>
                    <TabsContent value="all" className="mt-2">
                      <InvitationsList eventId={eventId} filter="all" />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-2">
                      <InvitationsList eventId={eventId} filter="pending" />
                    </TabsContent>
                    <TabsContent value="accepted" className="mt-2">
                      <InvitationsList eventId={eventId} filter="accepted" />
                    </TabsContent>
                    <TabsContent value="declined" className="mt-2">
                      <InvitationsList eventId={eventId} filter="declined" />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div style={{ width: "100%" }} className="lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1 mt-3 sm:mt-0">
          <Card style={{ width: "100%" }}>
            <CardHeader className="bg-primary/5 border-b p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
                New Invitation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Send personalized invitations to guests for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <InvitationForm eventId={params.id} />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex items-center justify-center p-2 sm:p-3 md:p-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <InfoIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs">Guests will receive an email with a personalized link</span>
              </div>
            </CardFooter>
          </Card>
          
          <Card style={{ width: "100%" }} className="p-3 bg-secondary/10">
            <div className="flex items-start gap-2">
              <InfoIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-xs sm:text-sm">Pro Tip: Send reminders</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Increase your response rate by sending reminders to guests who haven't responded yet
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 