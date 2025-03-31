import { z } from 'zod';
import { RsvpFormValues } from '@/types/rsvp';

/**
 * RSVP form validation schema
 */
export const rsvpFormSchema = z.object({
  // Basic RSVP fields
  status: z.enum(['accepted', 'declined', 'pending']),
  
  guestCount: z.number().min(1).default(1),
  
  // Conditional fields based on acceptance
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  
  // Plus-one information (conditional)
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
}).superRefine((data, ctx) => {
  // Check if plusOne is true but no name provided
  if (data.plusOne && (!data.plusOneName || data.plusOneName.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide your guest's name",
      path: ['plusOneName'],
    });
  }
});

/**
 * Convert form values to database insert values
 */
export const formValuesToRsvpInsert = (
  formValues: RsvpFormValues, 
  invitationId: string
): { 
  invitation_id: string; 
  status: string; 
  guest_count: number; 
  dietary_restrictions?: string; 
  notes?: string;
} => {
  return {
    invitation_id: invitationId,
    status: formValues.status,
    guest_count: formValues.plusOne ? 2 : 1,
    dietary_restrictions: formValues.dietaryRestrictions,
    notes: formValues.notes,
  };
};

export type RsvpFormSchema = z.infer<typeof rsvpFormSchema>; 