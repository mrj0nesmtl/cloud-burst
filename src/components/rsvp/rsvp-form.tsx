'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, PlusCircle, MinusCircle, User, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rsvpFormSchema, validatePlusOneFields } from '@/lib/validations/rsvp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Event = {
  id: string
  name: string
  host_name?: string
  description?: string
  start_date?: string
  end_date?: string
  location?: string
}

type Invitation = {
  id: string
  email?: string
  event_id: string
  status: string
  expires_at?: string | null
}

interface RsvpFormProps {
  invitation: Invitation
  event: Event
  token: string
}

export function RsvpForm({ invitation, event, token }: RsvpFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGuestFields, setShowGuestFields] = useState(false)
  const [hasPlusOne, setHasPlusOne] = useState(false)

  // Updated schema to include plus_one_name
  const extendedSchema = rsvpFormSchema.extend({
    plus_one_name: z.string().optional(),
    plus_one_email: z.string().email('Please enter a valid email').optional(),
    has_plus_one: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof extendedSchema>>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      status: 'accepted',
      name: '',
      email: invitation.email || '',
      phone: '',
      guest_count: 0,
      dietary_restrictions: '',
      notes: '',
      marketing_consent: false,
      has_plus_one: false,
      plus_one_name: '',
      plus_one_email: '',
    },
  })

  // Watch for status changes to show/hide guest fields
  const status = form.watch('status');
  const guestCount = form.watch('guest_count');
  const hasPlusOneWatch = form.watch('has_plus_one');

  useEffect(() => {
    setShowGuestFields(status === 'accepted');
    
    // Clear guest-related errors when declining
    if (status === 'declined') {
      form.clearErrors(['guest_count', 'has_plus_one', 'plus_one_name', 'plus_one_email', 'dietary_restrictions']);
    }
  }, [status, form]);

  useEffect(() => {
    setHasPlusOne(hasPlusOneWatch || false);
    
    // Apply conditional validation for plus one fields
    if (hasPlusOneWatch) {
      form.setError('plus_one_name', {
        type: 'manual',
        message: form.getValues('plus_one_name') ? '' : 'Plus one name is required'
      });
    } else {
      form.clearErrors('plus_one_name');
    }
  }, [hasPlusOneWatch, form]);

  const onSubmit = async (data: z.infer<typeof extendedSchema>) => {
    console.log("Form submission started:", data);
    
    // Check plus one validation before proceeding
    if (data.has_plus_one && (!data.plus_one_name || data.plus_one_name.length < 2)) {
      form.setError('plus_one_name', {
        type: 'manual',
        message: 'Plus one name is required'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate invitation ID exists
      if (!invitation.id) {
        throw new Error("Invalid invitation ID");
      }
      
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          invitationId: invitation.id,
          eventId: event.id,
        }),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("RSVP submission failed:", errorData);
        throw new Error(errorData.message || "Failed to submit RSVP");
      }
      
      // Handle successful submission
      toast.success("Your RSVP has been submitted successfully!");
      
      // Redirect to confirmation page or show confirmation UI
      if (data.status === 'accepted') {
        router.push(`/event/${event.slug}/confirmed`);
      } else {
        router.push(`/event/${event.slug}/declined`);
      }
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-2xl font-bold text-center text-primary">
          {event.name} - RSVP
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">Will you attend?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowGuestFields(value === 'accepted');
                        
                        // Reset guest-related fields when declining
                        if (value === 'declined') {
                          form.setValue('guest_count', 0);
                          form.setValue('has_plus_one', false);
                          form.setValue('plus_one_name', '');
                          form.setValue('plus_one_email', '');
                          form.setValue('dietary_restrictions', '');
                        }
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className={`flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/20 transition-colors cursor-pointer ${status === 'accepted' ? 'border-primary bg-primary/5' : ''}`}>
                        <FormControl>
                          <RadioGroupItem value="accepted" />
                        </FormControl>
                        <FormLabel className="font-normal text-base cursor-pointer flex items-center">
                          <Users className="mr-2 h-5 w-5 text-primary" />
                          Yes, I'll be there
                        </FormLabel>
                      </FormItem>
                      <FormItem className={`flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/20 transition-colors cursor-pointer ${status === 'declined' ? 'border-primary bg-primary/5' : ''}`}>
                        <FormControl>
                          <RadioGroupItem value="declined" />
                        </FormControl>
                        <FormLabel className="font-normal text-base cursor-pointer flex items-center">
                          <User className="mr-2 h-5 w-5 text-muted-foreground" />
                          No, I can't make it
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                        disabled={isSubmitting}
                        className={`bg-white ${form.formState.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        onChange={(e) => {
                          console.log('Name updated:', e.target.value);
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={Boolean(invitation.email) || isSubmitting}
                        className={`bg-white ${form.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        onChange={(e) => {
                          if (!invitation.email) {
                            console.log('Email updated:', e.target.value);
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {invitation.email ? "Email address cannot be changed" : "We'll send your confirmation to this email"}
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel className="text-base font-medium mb-1.5 block">
                    Phone Number (optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your phone number" 
                      className="h-12 px-4 text-base w-full rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-sm mt-1">
                    We'll only use this to contact you about this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showGuestFields && (
              <>
                <div className="bg-primary/5 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Guest Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="has_plus_one"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-card p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base">
                            I'm bringing a plus one
                          </FormLabel>
                          <FormDescription>
                            Add your plus one's details below
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {hasPlusOne && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pr-2 py-3 border-l-2 border-primary/30 ml-2">
                      <FormField
                        control={form.control}
                        name="plus_one_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Plus One Name <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Full name"
                                className={`h-12 ${form.formState.errors.plus_one_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="plus_one_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Plus One Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="email@example.com"
                                type="email"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="guest_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Additional Guests</FormLabel>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10"
                            onClick={() => field.onChange(Math.max(0, field.value - 1))}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-12 text-center mx-2"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10"
                            onClick={() => field.onChange(Math.min(3, field.value + 1))}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          Number of additional guests attending with you (max 3)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dietary_restrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium mb-1.5 block">
                          Dietary Restrictions (optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please list any dietary restrictions or allergies"
                            className="min-h-24 resize-none px-4 py-3 text-base rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium mb-1.5 block">
                    Additional Notes (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything else you'd like to share with the host"
                      className="min-h-24 resize-none px-4 py-3 text-base rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketing_consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to receive updates about this event and future events
                    </FormLabel>
                    <FormDescription>
                      You can unsubscribe at any time
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {invitation.expires_at && new Date(invitation.expires_at) < new Date() && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please note that the RSVP deadline has passed, but you can still submit your response.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium rounded-md bg-primary hover:bg-primary/90 text-white" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Submitting RSVP...</span>
                  </div>
                ) : (
                  status === 'accepted' ? 'Confirm Attendance' : 'Submit Response'
                )}
              </Button>
              {!isSubmitting && (
                <p className="text-center text-muted-foreground mt-2 text-sm">
                  By submitting, you confirm your RSVP details are correct
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 