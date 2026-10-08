import { z } from "zod";

export const FOLLOWUP_TYPES = ["Call", "Meeting", "Email", "Task"] as const;
export const FOLLOWUP_STATUSES = ["Planned", "Completed", "Missed", "Cancelled"] as const;

export const createFollowUpSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(2, "Subject must be at least 2 characters.")
    .max(150, "Subject cannot exceed 150 characters."),
  followUpType: z.enum(FOLLOWUP_TYPES).default("Call"),
  followUpDate: z
    .string()
    .min(1, "Follow-up date is required.")
    .refine(
      (val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      { message: "Follow-up date cannot be earlier than today." }
    ),
  status: z.enum(FOLLOWUP_STATUSES).default("Planned"),
  remarks: z
    .string()
    .trim()
    .max(1000, "Remarks cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
  assignedToId: z.string().optional(),
  customerId: z.string().optional().or(z.literal("")),
  leadId: z.string().optional().or(z.literal("")),
  opportunityId: z.string().optional().or(z.literal("")),
});

export const updateFollowUpSchema = createFollowUpSchema.partial();

export const completeFollowUpSchema = z.object({
  remarks: z.string().trim().max(1000, "Remarks cannot exceed 1000 characters.").optional(),
});

export type CreateFollowUpInput = z.input<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
export type CompleteFollowUpInput = z.infer<typeof completeFollowUpSchema>;
