'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronDown, Mail, Upload, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  name: string;
  date?: string;
  location?: string;
  status: string;
}

export default function CreateInvitationsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Check for mobile viewport
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Fetch user events
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  // Handle event selection
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  // Navigate to the selected event's invitation page
  const goToSelectedEvent = () => {
    if (selectedEventId) {
      router.push(`/protected/events/${selectedEventId}/invitations`);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1600px',
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '24px',
        gap: isMobile ? '16px' : '24px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0',
                height: 'auto'
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            lineHeight: '1.2',
            marginBottom: '4px'
          }}>
            Create Invitations
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Invite guests to your events via email or custom link
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Mail className="mr-2 h-5 w-5 text-primary" />
            New Invitations
          </CardTitle>
          <CardDescription>
            Choose how you want to create invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select-event" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="select-event">Select Event</TabsTrigger>
              <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
              <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="select-event" className="py-4">
              <div className="text-center py-8 space-y-4">
                <Calendar className="mx-auto h-12 w-12 text-primary opacity-80" />
                <h3 className="text-lg font-medium">Choose an Event</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select an event to create invitations for. This will allow you to manage RSVPs and track attendance.
                </p>
                
                <div className="max-w-md mx-auto mt-4">
                  {loading ? (
                    <p className="text-muted-foreground">Loading events...</p>
                  ) : events.length > 0 ? (
                    <div className="space-y-4">
                      <Select value={selectedEventId} onValueChange={handleEventSelect}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        className="w-full" 
                        disabled={!selectedEventId}
                        onClick={goToSelectedEvent}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Go to Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No events found</p>
                      <Button asChild>
                        <Link href="/protected/events/new">
                          Create New Event
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual-entry" className="py-4">
              <div className="text-center py-8 space-y-4">
                <UserPlus className="mx-auto h-12 w-12 text-primary opacity-80" />
                <h3 className="text-lg font-medium">Manual Guest Entry</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Manually enter guest details to create personalized invitations.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/protected/attendees/invitations/create">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Guests
                  </Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="bulk-upload" className="py-4">
              <div className="text-center py-8 space-y-4">
                <Upload className="mx-auto h-12 w-12 text-primary opacity-80" />
                <h3 className="text-lg font-medium">Bulk Upload</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload a CSV file with guest information to create multiple invitations at once.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/protected/attendees/invitations/bulk-upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 