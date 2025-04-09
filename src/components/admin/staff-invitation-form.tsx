'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from '@/components/ui/select'

const staffInvitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(['event_host', 'event_staff', 'contractor', 'photographer', 'technician', 'marketing']),
  permissions: z.array(z.string()).optional(),
  message: z.string().optional(),
});

interface StaffInvitationFormProps {
  eventId: string;
  staffType?: 'internal' | 'external';
  onSuccess?: () => void;
}

export function StaffInvitationForm({ 
  eventId, 
  staffType = 'internal',
  onSuccess 
}: StaffInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof staffInvitationSchema>>({
    resolver: zodResolver(staffInvitationSchema),
    defaultValues: {
      email: '',
      name: '',
      role: staffType === 'internal' ? 'event_staff' : 'contractor',
      permissions: [],
      message: '',
    },
  });
  
  // Update the role options based on staff type
  const roleOptions = staffType === 'internal' 
    ? [
        { value: 'event_host', label: 'Event Host', description: 'Can manage all aspects of the event' },
        { value: 'event_staff', label: 'Event Staff', description: 'Can upload content and assist with management' }
      ]
    : [
        { value: 'contractor', label: 'General Contractor', description: 'External partner with event access' },
        { value: 'photographer', label: 'Photographer', description: 'Can upload and manage event photos' },
        { value: 'technician', label: 'Technical Support', description: 'Provides technical assistance for the event' },
        { value: 'marketing', label: 'Marketing Partner', description: 'Has access to analytics and content' }
      ];
  
  async function onSubmit(values: z.infer<typeof staffInvitationSchema>) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/invitations/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          eventId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      toast({
        title: "Invitation sent",
        description: `Staff invitation sent to ${values.email}`,
      });
      
      form.reset();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error sending staff invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Staff member's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{staffType === 'internal' ? 'Internal Staff' : 'External Contractors'}</SelectLabel>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                {staffType === 'internal' 
                  ? 'Internal staff members have access to event management features.'
                  : 'External contractors have limited access based on their role.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </Button>
      </form>
    </Form>
  );
}
