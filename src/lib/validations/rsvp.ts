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
  marketing_consent: z.boolean().refine(val => val, {
    message: "You must agree to receive updates",
  }),
  // Plus one fields
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

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

export const rsvpSubmitSchema = z.object({
  invitation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  status: z.enum(["accepted", "declined"], {
    required_error: "Please indicate whether you will attend",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  phone: z.string().optional().nullable(),
  has_plus_one: z.boolean().optional().nullable(),
  plus_one_name: z.string().optional().nullable(),
  plus_one_email: z.string().optional().nullable(),
  guest_count: z.number().min(0).max(10).optional().nullable(),
  dietary_restrictions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  marketing_consent: z.boolean().optional().nullable(),
  token: z.string()
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
  
  if (hasPlusOne && data.plus_one_email && !z.string().email().safeParse(data.plus_one_email).success) {
    return { plus_one_email: "Please enter a valid email address for your plus one" };
  }
  
  return {};
}; 