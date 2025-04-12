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
import { toast } from 'sonner'
import { Loader2, PlusCircle, MinusCircle, User, Users } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rsvpFormSchema } from '@/lib/validations/rsvp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Event = {
  id: string
  name: string
  slug?: string
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
  const [showGuestFields, setShowGuestFields] = useState(true)
  const [hasPlusOne, setHasPlusOne] = useState(false)

  // Define form schema
  const formSchema = rsvpFormSchema.extend({
    plus_one_name: z.string().optional(),
    plus_one_email: z.string().email('Please enter a valid email').optional(),
    has_plus_one: z.boolean().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  // Watch form values
  const status = form.watch('status');
  const hasPlusOneWatch = form.watch('has_plus_one');

  // Handle status changes
  useEffect(() => {
    setShowGuestFields(status === 'accepted');
    
    // Clear guest-related fields when declining
    if (status === 'declined') {
      form.clearErrors(['guest_count', 'has_plus_one', 'plus_one_name', 'plus_one_email', 'dietary_restrictions']);
      form.setValue('guest_count', 0);
      form.setValue('has_plus_one', false);
      form.setValue('plus_one_name', '');
      form.setValue('plus_one_email', '');
      form.setValue('dietary_restrictions', '');
    }
  }, [status, form]);

  // Handle plus one changes
  useEffect(() => {
    setHasPlusOne(hasPlusOneWatch);
    
    // Validate plus one name when checkbox is checked
    if (hasPlusOneWatch) {
      const plusOneName = form.getValues('plus_one_name');
      if (!plusOneName || plusOneName.length < 2) {
        form.setError('plus_one_name', {
          type: 'manual',
          message: 'Plus one name is required'
        });
      }
    } else {
      form.clearErrors('plus_one_name');
    }
  }, [hasPlusOneWatch, form]);

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submission started:", data);
    
    // Validate plus one fields
    if (data.has_plus_one && (!data.plus_one_name || data.plus_one_name.length < 2)) {
      form.setError('plus_one_name', {
        type: 'manual',
        message: 'Plus one name is required'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate required IDs
      if (!invitation.id || !event.id) {
        throw new Error("Invalid invitation or event data");
      }
      
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Submit data to API
      const response = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitation_id: invitation.id,
          event_id: event.id,
          status: data.status,
          name: data.name,
          email: data.email,
          phone: data.phone,
          has_plus_one: data.has_plus_one,
          plus_one_name: data.plus_one_name,
          plus_one_email: data.plus_one_email,
          guest_count: data.guest_count || 0,
          dietary_restrictions: data.dietary_restrictions,
          notes: data.notes,
          marketing_consent: data.marketing_consent
        }),
      });
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit RSVP");
      }
      
      // Success message
      toast.success("Your RSVP has been submitted successfully!");
      
      // Redirect based on response
      const eventPath = event.slug || event.id;
      if (data.status === 'accepted') {
        router.push(`/event/${eventPath}/confirmed`);
      } else {
        router.push(`/event/${eventPath}/declined`);
      }
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-0">
      <CardHeader className="bg-primary/5 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-primary">
          {event.name} - RSVP
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Attendance Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-xl font-semibold">Will you attend?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowGuestFields(value === 'accepted');
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
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
            </div>

            <Separator className="my-6" />
            
            {/* Personal Information */}
            <div className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium mb-1.5 block">
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                          disabled={isSubmitting}
                          className="h-12 w-full text-base px-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Email Address */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium mb-1.5 block">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          disabled={Boolean(invitation.email) || isSubmitting}
                          className="h-12 w-full text-base px-4"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm mt-1">
                      {invitation.email ? "Email address cannot be changed" : "We'll send your confirmation to this email"}
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium mb-1.5 block">
                      Phone Number (optional)
                    </FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <Input 
                          placeholder="Your phone number" 
                          className="h-12 w-full text-base px-4" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm mt-1">
                      We'll only use this to contact you about this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Guest Information (Conditional) */}
            {showGuestFields && (
              <div className="bg-primary/5 p-6 rounded-lg space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-primary">Guest Information</h3>
                
                {/* Plus One */}
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

                {/* Plus One Details (Conditional) */}
                {hasPlusOne && (
                  <div className="grid grid-cols-1 gap-4 pl-6 pr-2 py-3 border-l-2 border-primary/30 ml-2">
                    <FormField
                      control={form.control}
                      name="plus_one_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium mb-1.5 block">
                            Plus One Name <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="w-full">
                              <Input
                                placeholder="Full name of your guest"
                                className="h-12 w-full text-base px-4"
                                {...field}
                              />
                            </div>
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
                          <FormLabel className="text-base font-medium mb-1.5 block">
                            Plus One Email
                          </FormLabel>
                          <FormControl>
                            <div className="w-full">
                              <Input
                                placeholder="email@example.com"
                                type="email"
                                className="h-12 w-full text-base px-4"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Additional Guests */}
                <FormField
                  control={form.control}
                  name="guest_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium mb-1.5 block">
                        Additional Guests
                      </FormLabel>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-r-none"
                          onClick={() => field.onChange(Math.max(0, field.value - 1))}
                        >
                          <MinusCircle className="h-5 w-5" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="3"
                            className="h-12 text-center rounded-none border-x-0 w-20"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-l-none"
                          onClick={() => field.onChange(Math.min(3, field.value + 1))}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                      <FormDescription className="text-sm mt-1">
                        Number of additional guests attending with you (max 3)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dietary Restrictions */}
                <FormField
                  control={form.control}
                  name="dietary_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium mb-1.5 block">
                        Dietary Restrictions (optional)
                      </FormLabel>
                      <FormControl>
                        <div className="w-full">
                          <Textarea
                            placeholder="Please list any dietary restrictions or allergies"
                            className="min-h-24 resize-none px-4 py-3 text-base w-full"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium mb-1.5 block">
                    Additional Notes (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="w-full">
                      <Textarea
                        placeholder="Anything else you'd like to share with the host"
                        className="min-h-24 resize-none px-4 py-3 text-base w-full"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marketing Consent */}
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
                    <FormLabel className="text-base">
                      I agree to receive updates about this event and future events
                    </FormLabel>
                    <FormDescription>
                      You can unsubscribe at any time
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Expiration Warning */}
            {invitation.expires_at && new Date(invitation.expires_at) < new Date() && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>
                  Please note that the RSVP deadline has passed, but you can still submit your response.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
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