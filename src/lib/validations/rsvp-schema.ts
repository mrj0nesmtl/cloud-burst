import { z } from 'zod'

export const rsvpFormSchema = z.object({
  status: z.enum(['accepted', 'declined', 'maybe']),
  guestCount: z.number().min(1).max(10).default(1),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().max(500).optional(),
  invitationId: z.string().uuid()
})

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>

// Transform function to convert form values to database format
export function transformRsvpFormToDb(values: RsvpFormValues) {
  return {
    invitation_id: values.invitationId,
    status: values.status,
    guest_count: values.plusOne ? values.guestCount + 1 : values.guestCount,
    plus_one: values.plusOne,
    plus_one_name: values.plusOneName || null,
    dietary_restrictions: values.dietaryRestrictions || null,
    notes: values.notes || null
  }
} 