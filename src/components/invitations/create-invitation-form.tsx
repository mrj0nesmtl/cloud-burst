'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Upload, Users } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';

// Form validation schemas
const singleInviteSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().optional(),
  plusOne: z.boolean().default(false),
  dietaryPreferences: z.string().optional(),
  notes: z.string().optional(),
});

const bulkInviteSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  csvFile: z.any(),
  message: z.string().optional(),
  plusOne: z.boolean().default(false),
});

type SingleInviteFormValues = z.infer<typeof singleInviteSchema>;
type BulkInviteFormValues = z.infer<typeof bulkInviteSchema>;

export function CreateInvitationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: events, isLoading: eventsLoading } = useEvents();
  
  // Initialize forms
  const singleForm = useForm<SingleInviteFormValues>({
    resolver: zodResolver(singleInviteSchema),
    defaultValues: {
      message: '',
      plusOne: false,
    },
  });

  const bulkForm = useForm<BulkInviteFormValues>({
    resolver: zodResolver(bulkInviteSchema),
    defaultValues: {
      message: '',
      plusOne: false,
    },
  });

  // Handle single invitation submission
  const onSingleSubmit = async (data: SingleInviteFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Call your API endpoint to create and send invitation
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      toast({
        title: 'Success',
        description: 'Invitation sent successfully!',
      });

      singleForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk invitation submission
  const onBulkSubmit = async (data: BulkInviteFormValues) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('eventId', data.eventId);
      formData.append('csvFile', data.csvFile);
      formData.append('message', data.message || '');
      formData.append('plusOne', String(data.plusOne));

      const response = await fetch('/api/invitations/bulk-create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send invitations');

      toast({
        title: 'Success',
        description: 'Bulk invitations sent successfully!',
      });

      bulkForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          <span>Single Invitation</span>
        </TabsTrigger>
        <TabsTrigger value="bulk" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Bulk Invitations</span>
        </TabsTrigger>
      </TabsList>

      {/* Single Invitation Form */}
      <TabsContent value="single">
        <Card>
          <CardHeader>
            <CardTitle>Send Single Invitation</CardTitle>
            <CardDescription>
              Send an invitation to a single attendee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6">
                {/* Event Selection */}
                <FormField
                  control={singleForm.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Event</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={eventsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events?.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={singleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter attendee name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={singleForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Message */}
                <FormField
                  control={singleForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a personal message to the invitation..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be included in the invitation email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Plus One Option */}
                <FormField
                  control={singleForm.control}
                  name="plusOne"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Plus One</FormLabel>
                        <FormDescription>
                          Allow this attendee to bring a guest
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Dietary Preferences */}
                <FormField
                  control={singleForm.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter any dietary requirements" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Add any dietary preferences or restrictions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={singleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional notes..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Add any additional notes about this attendee
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitation
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bulk Invitations Form */}
      <TabsContent value="bulk">
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Invitations</CardTitle>
            <CardDescription>
              Upload a CSV file with multiple attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                {/* Event Selection */}
                <FormField
                  control={bulkForm.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Event</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={eventsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events?.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CSV File Upload */}
                <FormField
                  control={bulkForm.control}
                  name="csvFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Upload CSV</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a CSV file with columns: name, email, dietary_preferences (optional), notes (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Message */}
                <FormField
                  control={bulkForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a message to include in all invitations..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be included in all invitation emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Plus One Option */}
                <FormField
                  control={bulkForm.control}
                  name="plusOne"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Plus One</FormLabel>
                        <FormDescription>
                          Allow all attendees to bring a guest
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitations
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Send
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 