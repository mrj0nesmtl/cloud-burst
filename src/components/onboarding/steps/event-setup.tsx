import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const eventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date().min(new Date(), 'Event date must be in the future'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['wedding', 'corporate', 'social', 'other'], {
    required_error: 'Please select an event type',
  }),
  expected_guests: z.number().min(1, 'Must have at least 1 guest').max(10000, 'Maximum 10,000 guests'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventSetupProps {
  user: User;
  profile: any;
  onComplete: (data: any) => void;
}

export function EventSetup({ user, profile, onComplete }: EventSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      date: new Date(),
      location: '',
      type: 'other',
      expected_guests: 100,
    },
  });

  async function onSubmit(data: EventFormData) {
    try {
      setIsLoading(true);

      // Create event in Supabase
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          name: data.name,
          description: data.description,
          date: data.date.toISOString(),
          location: data.location,
          type: data.type,
          expected_guests: data.expected_guests,
          organizer_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      await markOnboardingComplete();
      
      // Move to next step
      onComplete(event);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create event. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // New function to mark onboarding as complete
  async function markOnboardingComplete() {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) throw profileError;
  }

  // New function to handle skipping
  async function handleSkip() {
    try {
      setIsLoading(true);
      await markOnboardingComplete();
      
      toast({
        title: 'Welcome to Cloud Burst!',
        description: 'You can create your first event anytime from the dashboard.',
      });

      // Move to next step with no event data
      onComplete(null);
    } catch (error) {
      console.error('Error skipping event creation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create Your First Event</h2>
        <p className="text-muted-foreground">Let's set up your first event and get started.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register('description')}
            disabled={isLoading}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !form.getValues('date') && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.getValues('date') ? (
                  format(form.getValues('date'), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.getValues('date')}
                onSelect={(date) => form.setValue('date', date || new Date())}
                disabled={(date) =>
                  date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.date && (
            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...form.register('location')}
            disabled={isLoading}
          />
          {form.formState.errors.location && (
            <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Event Type</Label>
          <select
            id="type"
            {...form.register('type')}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            disabled={isLoading}
          >
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate Event</option>
            <option value="social">Social Gathering</option>
            <option value="other">Other</option>
          </select>
          {form.formState.errors.type && (
            <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_guests">Expected Number of Guests</Label>
          <Input
            id="expected_guests"
            type="number"
            {...form.register('expected_guests', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {form.formState.errors.expected_guests && (
            <p className="text-sm text-red-500">{form.formState.errors.expected_guests.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
} 