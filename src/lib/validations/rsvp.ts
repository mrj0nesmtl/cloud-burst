import { z } from "zod";

export const rsvpFormSchema = z.object({
  status: z.enum(['accepted', 'declined']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  guest_count: z.number().min(0).max(3, 'Maximum 3 additional guests allowed'),
  dietary_restrictions: z.string().optional(),
  notes: z.string().optional(),
  marketing_consent: z.boolean().default(false)
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

export const rsvpSubmitSchema = rsvpFormSchema.extend({
  invitation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  token: z.string()
});

export const rsvpApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status: z.enum(["accepted", "declined", "pending"]).optional(),
});

export type RsvpApiResponse = z.infer<typeof rsvpApiResponseSchema>; 