import { z } from "zod";

export const OPPORTUNITY_STAGES = [
  "Qualification",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;

export const OPPORTUNITY_STATUSES = ["Open", "Closed"] as const;

export const createOpportunitySchema = z
  .object({
    opportunityName: z
      .string()
      .trim()
      .min(2, "Opportunity name must be at least 2 characters.")
      .max(100, "Opportunity name cannot exceed 100 characters."),
    customerId: z.string().min(1, "Customer selection is required."),
    leadId: z.string().optional().or(z.literal("")),
    amount: z
      .number()
      .gt(0, "Opportunity Amount must be greater than 0."),
    stage: z.enum(OPPORTUNITY_STAGES).default("Qualification"),
    probability: z
      .number()
      .min(0, "Probability must be between 0 and 100.")
      .max(100, "Probability must be between 0 and 100.")
      .default(20),
    expectedCloseDate: z
      .string()
      .min(1, "Expected Close Date is required.")
      .refine(
        (val) => {
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        { message: "Expected Close Date cannot be in the past." }
      ),
    status: z.enum(OPPORTUNITY_STATUSES).default("Open"),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters.")
      .optional()
      .or(z.literal("")),
    assignedToId: z.string().optional(),
  });

export const updateOpportunitySchema = z
  .object({
    opportunityName: z.string().trim().min(2).max(100).optional(),
    customerId: z.string().optional(),
    leadId: z.string().optional().or(z.literal("")),
    amount: z.number().gt(0, "Opportunity Amount must be greater than 0.").optional(),
    stage: z.enum(OPPORTUNITY_STAGES).optional(),
    probability: z
      .number()
      .min(0, "Probability must be between 0 and 100.")
      .max(100, "Probability must be between 0 and 100.")
      .optional(),
    expectedCloseDate: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        { message: "Expected Close Date cannot be in the past." }
      )
      .optional(),
    status: z.enum(OPPORTUNITY_STATUSES).optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    assignedToId: z.string().optional(),
  });

export const changeStageSchema = z.object({
  stage: z.enum(OPPORTUNITY_STAGES),
  reason: z.string().trim().optional(),
});

export type CreateOpportunityInput = z.input<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type ChangeStageInput = z.infer<typeof changeStageSchema>;
