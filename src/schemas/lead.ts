import { z } from "zod";

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Call",
  "Tradeshow",
  "Partner",
  "Inbound Email",
  "LinkedIn",
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Unqualified",
  "Converted",
  "Lost",
] as const;

export const LEAD_PRIORITIES = ["Low", "Medium", "High"] as const;

export const createLeadSchema = z.object({
  leadName: z
    .string()
    .trim()
    .min(2, "Lead name must be at least 2 characters.")
    .max(100, "Lead name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .refine((val) => /^[6-9]\d{9}$/.test(val.replace(/\s+/g, "").replace(/^\+91/, "")), {
      message: "Please enter a valid 10-digit Indian mobile number.",
    }),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters."),
  source: z.enum(LEAD_SOURCES).default("Website"),
  status: z.enum(LEAD_STATUSES).default("New"),
  priority: z.enum(LEAD_PRIORITIES).default("Medium"),
  expectedValue: z
    .number()
    .min(0, "Expected value cannot be negative.")
    .default(0),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
  assignedToId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const convertLeadSchema = z.object({
  city: z.string().trim().min(2, "City is required for customer creation.").max(50),
  state: z.string().trim().min(2, "State is required for customer creation.").max(50),
  address: z.string().trim().optional(),
  createOpportunity: z.boolean().default(true),
  opportunityName: z.string().trim().optional(),
  amount: z.number().min(1, "Opportunity amount must be greater than 0.").optional(),
  expectedCloseDate: z.string().optional(),
});

export type CreateLeadInput = z.input<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
