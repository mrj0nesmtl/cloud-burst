import { z } from "zod";

export const rsvpSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  status: z.enum(["accepted", "declined", "pending"], {
    required_error: "RSVP status is required",
  }),
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  plusOne: z.object({
    used: z.boolean().default(false),
    name: z.string().optional(),
  }),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;

export const rsvpApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status: z.enum(["accepted", "declined", "pending"]).optional(),
});

export type RsvpApiResponse = z.infer<typeof rsvpApiResponseSchema>; 