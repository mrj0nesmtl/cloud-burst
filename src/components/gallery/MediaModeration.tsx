"use client"

import { useState } from 'react'
import { CheckCircle, XCircle, Filter } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { MediaGrid } from './MediaGrid'
import { useMediaStore } from '@/store/media-store'
import { Media, MediaStatus } from '@/types/media'

interface MediaModerationProps {
  eventId: string
  userId: string
  isOrganizer: boolean
}

/**
 * Component for moderating media uploads for an event
 */
export function MediaModeration({
  eventId,
  userId,
  isOrganizer
}: MediaModerationProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(false)
  
  // Get media store state and actions
  const { 
    pendingMedia,
    approvedMedia,
    rejectedMedia,
    approveMedia,
    rejectMedia,
    fetchEventPendingMedia,
    fetchEventApprovedMedia,
    fetchEventRejectedMedia 
  } = useMediaStore()
  
  // Load media data based on active tab
  const refreshMedia = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'pending') {
        await fetchEventPendingMedia(eventId)
      } else if (activeTab === 'approved') {
        await fetchEventApprovedMedia(eventId)
      } else if (activeTab === 'rejected') {
        await fetchEventRejectedMedia(eventId)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'Failed to load media. Please try again.',
        variant: 'destructive'
      })
    }
    setIsLoading(false)
  }
  
  // Handle tab change
  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    setIsLoading(true)
    
    try {
      if (value === 'pending') {
        await fetchEventPendingMedia(eventId)
      } else if (value === 'approved') {
        await fetchEventApprovedMedia(eventId)
      } else if (value === 'rejected') {
        await fetchEventRejectedMedia(eventId)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'Failed to load media. Please try again.',
        variant: 'destructive'
      })
    }
    
    setIsLoading(false)
  }
  
  // Handle media approval
  const handleApprove = async (media: Media) => {
    try {
      await approveMedia(media.id)
      toast({
        title: 'Media Approved',
        description: 'The media has been approved and is now visible to event attendees.',
        variant: 'default'
      })
      
      // Refresh current tab data
      await refreshMedia()
    } catch (error) {
      console.error('Error approving media:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve media. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  // Handle media rejection
  const handleReject = async (media: Media) => {
    try {
      await rejectMedia(media.id)
      toast({
        title: 'Media Rejected',
        description: 'The media has been rejected and will not be visible to event attendees.',
        variant: 'default'
      })
      
      // Refresh current tab data
      await refreshMedia()
    } catch (error) {
      console.error('Error rejecting media:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject media. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  // If not an organizer, don't show the moderation interface
  if (!isOrganizer) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={<Filter className="h-10 w-10 text-muted-foreground" />}
            title="Access Restricted"
            description="Only event organizers can moderate media uploads."
          />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Moderation</CardTitle>
        <CardDescription>
          Approve or reject media uploads for this event
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending
              {pendingMedia.length > 0 && (
                <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-800/20 dark:text-orange-500">
                  {pendingMedia.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0">
            <MediaGrid 
              mediaItems={pendingMedia}
              isLoading={isLoading}
              emptyMessage="No pending media uploads to review."
              onApprove={handleApprove}
              onReject={handleReject}
              showControls={true}
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            <MediaGrid 
              mediaItems={approvedMedia}
              isLoading={isLoading}
              emptyMessage="No approved media found."
              onReject={handleReject}
              showControls={true}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            <MediaGrid 
              mediaItems={rejectedMedia}
              isLoading={isLoading}
              emptyMessage="No rejected media found."
              onApprove={handleApprove}
              showControls={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 