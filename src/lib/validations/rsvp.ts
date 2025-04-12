import * as z from "zod";

export const rsvpFormSchema = z.object({
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
  // Plus one fields will be validated conditionally in the component
  has_plus_one: z.boolean().optional(),
  plus_one_name: z.string().optional(),
  plus_one_email: z.string().email({
    message: "Please enter a valid email address for your plus one",
  }).optional(),
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

// This is a custom validator to use when plus one is checked
export const validatePlusOneFields = (data: z.infer<typeof rsvpFormSchema>, hasPlusOne: boolean) => {
  if (hasPlusOne && (!data.plus_one_name || data.plus_one_name.length < 2)) {
    return { plus_one_name: "Plus one name is required" };
  }
  return {};
}; 