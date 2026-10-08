import { z } from "zod";

export const ACTIVITY_TYPES = ["Call", "Meeting", "Email", "Note"] as const;

export const createActivitySchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  subject: z
    .string()
    .trim()
    .min(2, "Subject must be at least 2 characters.")
    .max(150, "Subject cannot exceed 150 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
  activityDate: z.string().optional(),
  customerId: z.string().optional().or(z.literal("")),
  leadId: z.string().optional().or(z.literal("")),
  opportunityId: z.string().optional().or(z.literal("")),
  assignedToId: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
