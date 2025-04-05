'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Upload, Users, CheckCircle } from 'lucide-react';
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

export function CreateInvitationForm({ eventId }: { eventId?: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: events, isLoading: eventsLoading } = useEvents();
  
  // Add a state to track the current step and completion
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(eventId ? [1] : []);

  // Function to mark a step as completed
  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  // Function to advance to the next step
  const goToNextStep = (step: number) => {
    completeStep(step);
    setCurrentStep(step + 1);
  };

  // Initialize forms with eventId if provided
  const singleForm = useForm<SingleInviteFormValues>({
    resolver: zodResolver(singleInviteSchema),
    defaultValues: {
      eventId: eventId || '',
      name: '',
      email: '',
      message: '',
      plusOne: false,
      dietaryPreferences: '',
      notes: '',
    },
    mode: 'onChange',
  });

  // Track form validity for step completion
  const isStep1Valid = singleForm.getValues().eventId !== '';
  const isStep2Valid = singleForm.formState.isValid && 
                      singleForm.getValues().name !== '' && 
                      singleForm.getValues().email !== '';

  // Watch form fields for step 2 validation
  const watchName = singleForm.watch('name');
  const watchEmail = singleForm.watch('email');

  // Update completed steps when form fields change
  useEffect(() => {
    if (isStep1Valid) {
      completeStep(1);
    }
    
    if (isStep2Valid) {
      completeStep(2);
    }
  }, [isStep1Valid, isStep2Valid, watchName, watchEmail]);

  const bulkForm = useForm<BulkInviteFormValues>({
    resolver: zodResolver(bulkInviteSchema),
    defaultValues: {
      eventId: eventId || '',
      csvFile: undefined,
      message: '',
      plusOne: false,
    },
  });

  // Handle single invitation submission
  const onSingleSubmit = async (data: SingleInviteFormValues) => {
    try {
      setIsSubmitting(true);
      completeStep(3); // Mark the final step as complete when submitting
      
      // Call your API endpoint to create and send invitation
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Error response:', response.status, responseData);
        
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Your session may have expired. Please refresh the page and try again.',
            variant: 'destructive',
          });
          return;
        }
        
        throw new Error(responseData.error || 'Failed to send invitation');
      }

      // Handle warnings
      if (responseData.warning) {
        toast({
          title: 'Invitation Created',
          description: responseData.warning,
          variant: 'default',
        });
      } else {
        toast({
          title: '📧 Invitation Sent 👍',
          description: `Successfully sent invitation to ${data.email}`,
          variant: 'success',
        });
      }

      // Reset form
      singleForm.reset();
      
      // Redirect back to the event page
      if (data.eventId) {
        router.push(`/protected/events/${data.eventId}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation. Please try again.',
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
        title: '📧 Invitations Sent 👍',
        description: 'Successfully sent bulk invitations!',
        variant: 'success',
      });

      // Reset form
      bulkForm.reset();
      
      // Redirect back to the event page
      if (data.eventId) {
        router.push(`/protected/events/${data.eventId}`);
      }
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
    <div className="space-y-6">
      {/* Progress indicators */}
      <div className="hidden sm:block">
        <div className="bg-muted p-4 rounded-lg">
          <ol className="flex items-center justify-between text-sm font-medium text-center">
            <li 
              className={`flex items-center cursor-pointer ${
                completedSteps.includes(1) 
                  ? 'text-green-600' 
                  : currentStep === 1 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
              }`}
              onClick={() => setCurrentStep(1)}
            >
              <span className={`flex items-center justify-center w-6 h-6 mr-2 rounded-full ${
                completedSteps.includes(1) 
                  ? 'bg-green-600 text-white' 
                  : currentStep === 1 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {completedSteps.includes(1) ? '✓' : '1'}
              </span>
              Select Event
            </li>
            <li className={`flex-1 border-t-2 ${
              completedSteps.includes(1) ? 'border-green-600' : 'border-gray-200'
            } mx-2`}></li>
            <li 
              className={`flex items-center cursor-pointer ${
                completedSteps.includes(2) 
                  ? 'text-green-600' 
                  : currentStep === 2 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
              }`}
              onClick={() => isStep1Valid && setCurrentStep(2)}
            >
              <span className={`flex items-center justify-center w-6 h-6 mr-2 rounded-full ${
                completedSteps.includes(2) 
                  ? 'bg-green-600 text-white' 
                  : currentStep === 2 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {completedSteps.includes(2) ? '✓' : '2'}
              </span>
              Add Guest Info
            </li>
            <li className={`flex-1 border-t-2 ${
              completedSteps.includes(2) ? 'border-green-600' : 'border-gray-200'
            } mx-2`}></li>
            <li 
              className={`flex items-center cursor-pointer ${
                completedSteps.includes(3) 
                  ? 'text-green-600' 
                  : currentStep === 3 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
              }`}
              onClick={() => isStep2Valid && setCurrentStep(3)}
            >
              <span className={`flex items-center justify-center w-6 h-6 mr-2 rounded-full ${
                completedSteps.includes(3) 
                  ? 'bg-green-600 text-white' 
                  : currentStep === 3 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {completedSteps.includes(3) ? '✓' : '3'}
              </span>
              Send Invitation
            </li>
          </ol>
        </div>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Single Guest</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Multiple Guests</span>
          </TabsTrigger>
        </TabsList>

        {/* Single Guest Form */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Invite a Single Guest</CardTitle>
              <CardDescription>
                Send a personalized invitation to one person
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...singleForm}>
                <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6">
                  {/* Event Selection - Step 1 */}
                  <div className={currentStep === 1 ? 'block' : 'hidden'}>
                    <FormField
                      control={singleForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Event</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value) setTimeout(() => goToNextStep(1), 500);
                            }} 
                            defaultValue={field.value}
                            disabled={eventsLoading || !!eventId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {events?.length === 0 ? (
                                <div className="px-2 py-4 text-center">
                                  <p className="text-sm text-muted-foreground">No events found</p>
                                  <Button
                                    variant="outline" 
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => router.push('/protected/events/create')}
                                  >
                                    Create New Event
                                  </Button>
                                </div>
                              ) : (
                                events?.map((event) => (
                                  <SelectItem key={event.id} value={event.id}>
                                    {event.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => isStep1Valid && goToNextStep(1)}
                        disabled={!isStep1Valid}
                      >
                        Next: Add Guest Info
                      </Button>
                    </div>
                  </div>

                  {/* Guest Info - Step 2 */}
                  <div className={currentStep === 2 ? 'block' : 'hidden'}>
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
                        <FormItem className="mt-4">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => isStep2Valid && goToNextStep(2)}
                        disabled={!isStep2Valid}
                      >
                        Next: Complete Invitation
                      </Button>
                    </div>
                  </div>

                  {/* Final Step - Step 3 */}
                  <div className={currentStep === 3 ? 'block' : 'hidden'}>
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4 p-4 border rounded-md">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Plus One</FormLabel>
                            <FormDescription>
                              Guest can bring an additional person
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Dietary Preferences */}
                    <FormField
                      control={singleForm.control}
                      name="dietaryPreferences"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Dietary Preferences</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional dietary preferences or restrictions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Additional Notes */}
                    <FormField
                      control={singleForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Optional notes for this guest" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || !isStep2Valid}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multiple Guests Form */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Invite Multiple Guests</CardTitle>
              <CardDescription>
                Upload a CSV file with a list of guests to invite
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
                          disabled={eventsLoading || !!eventId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {events?.length === 0 ? (
                              <div className="px-2 py-4 text-center">
                                <p className="text-sm text-muted-foreground">No events found</p>
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => router.push('/protected/events/create')}
                                >
                                  Create New Event
                                </Button>
                              </div>
                            ) : (
                              events?.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.name}
                                </SelectItem>
                              ))
                            )}
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Upload Guest List CSV</FormLabel>
                          <a 
                            href="/api/templates/invitees-template" 
                            target="_blank"
                            className="text-xs text-primary hover:underline"
                          >
                            Download Template
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="space-y-2">
                          <p>Upload a CSV file with the following columns:</p>
                          <div className="bg-muted p-3 rounded text-sm font-mono">
                            name,email,dietary_preferences,notes
                          </div>
                          <p className="text-xs">Example: <span className="font-mono">John Doe,john@example.com,vegetarian,VIP guest</span></p>
                          <p className="text-xs">* Only name and email are required</p>
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
                        Sending Invitations...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload and Send Invitations
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Personalized emails will be sent to all guests in your CSV file
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 