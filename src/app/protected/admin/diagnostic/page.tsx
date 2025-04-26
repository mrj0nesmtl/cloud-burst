'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Database as DatabaseIcon, Users } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function DiagnosticPage() {
  const supabase = createClientComponentClient<Database>()
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDbInfo = async () => {
      setLoading(true)
      try {
        // Get some basic table counts
        const { data: profileCount, error: profileError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        
        const { data: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          
        const { data: attendeesCount, error: attendeesError } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          
        const { data: invitationsCount, error: invitationsError } = await supabase
          .from('invitations')
          .select('*', { count: 'exact', head: true })
          
        const { data: mediaCount, error: mediaError } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          
        setDbInfo({
          profileCount: profileCount?.count || 0,
          eventsCount: eventsCount?.count || 0,
          attendeesCount: attendeesCount?.count || 0,
          invitationsCount: invitationsCount?.count || 0,
          mediaCount: mediaCount?.count || 0,
        })
      } catch (error) {
        console.error('Error fetching database info:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDbInfo()
  }, [supabase])
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and troubleshoot system data consistency and performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Database Overview</CardTitle>
            <CardDescription>Current record counts across main tables</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profiles</span>
                  <Badge variant="outline">{dbInfo?.profileCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Events</span>
                  <Badge variant="outline">{dbInfo?.eventsCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Event Attendees</span>
                  <Badge variant="outline">{dbInfo?.attendeesCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Invitations</span>
                  <Badge variant="outline">{dbInfo?.invitationsCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Media Items</span>
                  <Badge variant="outline">{dbInfo?.mediaCount}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Diagnostic Tools</CardTitle>
            <CardDescription>Tools to check and repair data consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Link href="/protected/admin/diagnostic/guest-consistency">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Users className="h-4 w-4 mr-2" />
                    Guest Data Consistency
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground pl-2">
                  Check consistency between guest profiles, attendees and invitations
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" disabled>
                  <DatabaseIcon className="h-4 w-4 mr-2" />
                  Database Health Check
                </Button>
                <p className="text-xs text-muted-foreground pl-2">
                  Verify database indexes and performance metrics (coming soon)
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" disabled>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Error Logs Analysis
                </Button>
                <p className="text-xs text-muted-foreground pl-2">
                  Review system error logs and exceptions (coming soon)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p>Note: These diagnostic tools are available to system administrators only.</p>
      </div>
    </div>
  )
} 