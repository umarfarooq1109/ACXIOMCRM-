import { z } from "zod";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
];

export const normalizePhone = (phone: string): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters.")
    .max(100, "Customer name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(100, "Email address cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .refine((val) => /^[6-9]\d{9}$/.test(normalizePhone(val)), {
      message: "Enter a valid 10-digit Indian phone number starting with 6-9.",
    }),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters."),
  address: z.string().trim().max(255, "Address cannot exceed 255 characters.").optional().or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters.")
    .max(50, "City cannot exceed 50 characters."),
  state: z
    .string()
    .trim()
    .min(2, "State is required.")
    .max(50),
  status: z.enum(["Active", "Inactive", "Prospect"]).optional().default("Active"),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters.").optional().or(z.literal("")),
  ownerId: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  customerName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().max(100).optional(),
  phone: z
    .string()
    .trim()
    .refine((val) => /^[6-9]\d{9}$/.test(normalizePhone(val)), {
      message: "Enter a valid 10-digit Indian phone number starting with 6-9.",
    })
    .optional(),
  companyName: z.string().trim().min(2).max(100).optional(),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(50).optional(),
  state: z.string().trim().min(2).max(50).optional(),
  status: z.enum(["Active", "Inactive", "Prospect"]).optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const changeOwnerSchema = z.object({
  newOwnerId: z.string().uuid("Select a valid new owner."),
  reason: z.string().trim().min(3, "Reason is required to reassign customer.").max(255),
});

export type CreateCustomerInput = z.input<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ChangeOwnerInput = z.infer<typeof changeOwnerSchema>;
