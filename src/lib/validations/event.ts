import { z } from "zod";

export const eventIdSchema = z.string().uuid("Event ID must be a valid UUID"); 