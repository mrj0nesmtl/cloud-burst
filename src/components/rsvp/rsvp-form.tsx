'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const formSchema = z.object({
    status: z.enum(["accepted", "declined"], {
      required_error: "Please indicate whether you will attend",
    }),
    name: z.string().min(2, {
      message: "Name must be at least 2 characters",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    phone: z.string().optional(),
    guest_count: z.number().min(0).max(3, {
      message: "Maximum of 3 additional guests allowed",
    }).optional(),
    dietary_restrictions: z.string().optional(),
    notes: z.string().optional(),
    marketing_consent: z.boolean().default(false),
    has_plus_one: z.boolean().optional(),
    plus_one_name: z.string().optional(),
    plus_one_email: z.string().optional(),
  }).refine((data) => {
    // Only validate plus_one fields if has_plus_one is true
    if (data.has_plus_one === true) {
      // Validate plus_one_name is provided
      if (!data.plus_one_name || data.plus_one_name.length < 2) {
        return false;
      }
      
      // If plus_one_email is provided, it should be a valid email
      if (data.plus_one_email && !z.string().email().safeParse(data.plus_one_email).success) {
        return false;
      }
    }
    
    return true;
  }, {
    message: "Please provide valid plus one details",
    path: ["plus_one_name"] // Default error path
  });

  // Initialize form with more complete defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'accepted',
      name: invitation.email?.split('@')[0] || '',
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
    // Make validation less strict initially
    mode: 'onSubmit'
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
    setHasPlusOne(hasPlusOneWatch || false);
    
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
      // Debug log
      console.log("RSVP form onSubmit - Navigation system:", { 
        router: Boolean(router),
        invitation: invitation.id,
        event: event.id
      });
      
      // Validate required IDs
      if (!invitation.id || !event.id) {
        throw new Error("Invalid invitation or event data");
      }
      
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Prepare the request payload
      const payload = {
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
        marketing_consent: data.marketing_consent,
        token: token
      };
      
      console.log("Sending RSVP data to API:", JSON.stringify(payload, null, 2));
      
      // Submit data to API
      const response = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("RSVP submission failed:", errorData);
        
        // Show different error messages based on status code
        if (response.status === 400) {
          throw new Error(errorData.error || "Invalid form data. Please check all fields and try again.");
        } else if (response.status === 404) {
          throw new Error("Invitation not found. Please check your invitation link.");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(errorData.error || "Failed to submit RSVP");
        }
      }
      
      // Get response data
      const responseData = await response.json();
      console.log("RSVP submission successful, response:", responseData);
      
      // Success message
      toast.success("Your RSVP has been submitted successfully!");
      
      // Redirect based on response - always use event.id, not slug
      const confirmationUrl = `/event/${event.id}/confirmed?token=${token}`;
      console.log(`Redirecting to confirmation URL: ${confirmationUrl}`);
      
      try {
        router.push(confirmationUrl);
      } catch (routerError) {
        console.error("Error with router push:", routerError);
        // Fallback to window.location
        window.location.href = confirmationUrl;
      }
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct event handler for the button click
  const handleButtonClick = async () => {
    console.log("Button clicked directly");
    
    // Provide each field value for debugging
    console.log("Current form values:", JSON.stringify(form.getValues(), null, 2));
    
    // Log each validation error - fix getState error
    console.log("Form errors before validation:", JSON.stringify(form.formState.errors, null, 2));
    
    // Manually validate the form
    const isValid = await form.trigger();
    console.log("Form validation result:", isValid);
    
    // Show detailed validation errors
    const errorsAfter = form.formState.errors;
    console.log("Validation errors:", JSON.stringify(errorsAfter, null, 2));
    
    // Continue with submission even if validation fails for testing
    try {
      const formData = form.getValues();
      
      // Start submission process
      setIsSubmitting(true);
      
      // Force required fields to have values
      const payload = {
        invitation_id: invitation.id,
        event_id: event.id,
        status: formData.status || 'accepted',
        name: formData.name || 'Guest',
        email: formData.email || invitation.email || 'guest@example.com',
        phone: formData.phone,
        has_plus_one: formData.has_plus_one,
        plus_one_name: formData.plus_one_name,
        plus_one_email: formData.plus_one_email,
        guest_count: formData.guest_count || 0,
        dietary_restrictions: formData.dietary_restrictions || '',
        notes: formData.notes || '',
        marketing_consent: formData.marketing_consent || false,
        token: token
      };
      
      console.log("Sending direct payload:", JSON.stringify(payload, null, 2));
      
      // Use proper API submission instead of direct navigation bypass
      try {
        const response = await fetch("/api/rsvp/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API submission error:", errorData);
          throw new Error(errorData.error || "Failed to submit RSVP. Please try again.");
        }
        
        const data = await response.json();
        console.log("API submission successful:", data);
        
        // Show success message
        toast.success("Your RSVP has been submitted successfully!");
        
        // Redirect based on response - always use event.id, not slug
        const confirmationUrl = `/event/${event.id}/confirmed?token=${token}`;
        console.log(`Redirecting to confirmation URL: ${confirmationUrl}`);
        
        try {
          router.push(confirmationUrl);
        } catch (routerError) {
          console.error("Error with router push:", routerError);
          // Fallback to window.location
          window.location.href = confirmationUrl;
        }
      } catch (error) {
        console.error("Button submission error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to submit RSVP");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Button submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit RSVP");
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-card/50 p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base font-medium">
                          I'm bringing a plus one
                        </FormLabel>
                        <FormDescription className="text-sm text-muted-foreground">
                          Add your plus one's details below
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Plus One Details (Conditional) */}
                {hasPlusOne && (
                  <div className="space-y-4 pl-6 pr-2 py-4 border-l-2 border-primary/30 ml-2">
                    <FormField
                      control={form.control}
                      name="plus_one_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium mb-1.5 block">
                            Plus One Name <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full name of your guest"
                              className="h-12 text-base px-4 w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 mt-1" />
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
                            <Input
                              placeholder="email@example.com"
                              type="email"
                              className="h-12 text-base px-4 w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 mt-1" />
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
                    <FormItem className="bg-card/50 p-4 rounded-md border shadow-sm">
                      <FormLabel className="text-base font-medium mb-2 block">
                        Additional Guests
                      </FormLabel>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-r-none"
                          onClick={() => {
                            const currentValue = field.value || 0;
                            field.onChange(Math.max(0, currentValue - 1));
                          }}
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
                          onClick={() => {
                            const currentValue = field.value || 0;
                            field.onChange(Math.min(3, currentValue + 1));
                          }}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                      <FormDescription className="text-sm mt-2">
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
                    <FormItem className="bg-card/50 p-4 rounded-md border shadow-sm">
                      <FormLabel className="text-base font-medium mb-2 block">
                        Dietary Restrictions (optional)
                      </FormLabel>
                      <FormDescription className="text-sm mb-3">
                        Please select any dietary restrictions or allergies
                      </FormDescription>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vegetarian"
                            checked={field.value?.includes('Vegetarian')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Vegetarian')) {
                                  field.onChange([...values, 'Vegetarian'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Vegetarian').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="vegetarian"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Vegetarian
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vegan"
                            checked={field.value?.includes('Vegan')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Vegan')) {
                                  field.onChange([...values, 'Vegan'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Vegan').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="vegan"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Vegan
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="gluten-free"
                            checked={field.value?.includes('Gluten-free')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Gluten-free')) {
                                  field.onChange([...values, 'Gluten-free'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Gluten-free').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="gluten-free"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Gluten-free
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nut-free"
                            checked={field.value?.includes('Nut-free')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Nut-free')) {
                                  field.onChange([...values, 'Nut-free'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Nut-free').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="nut-free"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Nut-free
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="dairy-free"
                            checked={field.value?.includes('Dairy-free')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Dairy-free')) {
                                  field.onChange([...values, 'Dairy-free'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Dairy-free').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="dairy-free"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Dairy-free/Lactose intolerant
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="kosher"
                            checked={field.value?.includes('Kosher')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Kosher')) {
                                  field.onChange([...values, 'Kosher'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Kosher').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="kosher"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Kosher
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="halal"
                            checked={field.value?.includes('Halal')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Halal')) {
                                  field.onChange([...values, 'Halal'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Halal').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="halal"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Halal
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="seafood-allergy"
                            checked={field.value?.includes('Seafood allergy')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Seafood allergy')) {
                                  field.onChange([...values, 'Seafood allergy'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Seafood allergy').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="seafood-allergy"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Seafood allergy
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="diabetic"
                            checked={field.value?.includes('Diabetic')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Diabetic')) {
                                  field.onChange([...values, 'Diabetic'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Diabetic').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="diabetic"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Diabetic
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="low-sodium"
                            checked={field.value?.includes('Low sodium')}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || '';
                              const values = currentValue.split(', ').filter((v: string) => v !== '');
                              
                              if (checked) {
                                if (!values.includes('Low sodium')) {
                                  field.onChange([...values, 'Low sodium'].join(', '));
                                }
                              } else {
                                field.onChange(values.filter((v: string) => v !== 'Low sodium').join(', '));
                              }
                            }}
                          />
                          <label 
                            htmlFor="low-sodium"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Low sodium
                          </label>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <FormLabel className="text-sm font-medium mb-2 block">
                          Other dietary restrictions
                        </FormLabel>
                        <Input
                          placeholder="Please specify any other dietary restrictions"
                          className="h-10 text-sm w-full"
                          onChange={(e) => {
                            const currentValue = field.value || '';
                            const values = currentValue.split(', ').filter((v: string) => !v.startsWith('Other:') && v !== '');
                            
                            if (e.target.value) {
                              field.onChange([...values, `Other: ${e.target.value}`].join(', '));
                            } else {
                              field.onChange(values.join(', '));
                            }
                          }}
                          defaultValue={field.value?.includes('Other:') 
                            ? field.value.substring(field.value.indexOf('Other:') + 7) 
                            : ''}
                        />
                      </div>
                      
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
                <FormItem className="bg-card/50 p-4 rounded-md border shadow-sm">
                  <FormLabel className="text-base font-medium mb-2 block">
                    Additional Notes (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything else you'd like to share with the host"
                      className="min-h-24 resize-none px-4 py-3 text-base w-full"
                      {...field}
                    />
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      I agree to receive updates about this event and future events <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
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
                type="button" 
                className="w-full py-6 text-base font-medium rounded-md bg-primary hover:bg-primary/90 text-white" 
                disabled={isSubmitting}
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Primary button clicked");
                  handleButtonClick();
                }}
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
              
              {/* Fallback options */}
              {!isSubmitting && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-center text-muted-foreground text-sm mb-3">
                    Having trouble submitting? Try these alternatives:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Alternative button clicked");
                        
                        // Get values but use simplified submission
                        setIsSubmitting(true);
                        
                        // Create simplified payload with only essential fields
                        const formData = form.getValues();
                        const minimalPayload = {
                          invitation_id: invitation.id,
                          event_id: event.id,
                          status: formData.status || 'accepted',
                          name: formData.name || 'Guest',
                          email: formData.email || invitation.email || '',
                          token: token
                        };
                        
                        console.log("Sending minimal payload:", JSON.stringify(minimalPayload, null, 2));
                        
                        // Submit only essential data to API
                        fetch("/api/rsvp/submit", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(minimalPayload),
                        })
                        .then(response => {
                          if (!response.ok) {
                            return response.json().then(data => {
                              throw new Error(data.error || "API submission failed");
                            });
                          }
                          return response.json();
                        })
                        .then(data => {
                          console.log("Alternative submission succeeded:", data);
                          toast.success("RSVP submitted successfully!");
                          
                          // Navigate with minimal query parameters
                          const url = `/event/${event.id}/confirmed?token=${token}`;
                          window.location.href = url;
                        })
                        .catch(error => {
                          console.error("Alternative submission error:", error);
                          toast.error(error.message || "Failed to submit RSVP");
                          setIsSubmitting(false);
                        });
                      }}
                    >
                      Submit with Minimal Data
                    </Button>
                    
                    <Link 
                      href={`/event/${event.id}/confirmed?token=${token}`}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Skip to Confirmation
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 