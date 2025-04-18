import { z } from "zod";
import { PermissionStatus } from "../../database/anum/permission.enum";

// Define schema for the "company" section
const companyDetailsSchema = z.object({
  net_earning: z.number().positive(),
  fee_percentage: z.number().min(0).max(100), // Assuming percentage is 0-100
});

export const companySchema = z.object({
  company: companyDetailsSchema,
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Update schemas
const updateCompanyDetailsSchema = z.object({
  net_earning: z.number().positive().optional(),
  fee_percentage: z.number().min(0).max(100).optional(),
});

export const updateCompanySchema = z.object({
  company: updateCompanyDetailsSchema.optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(4, "Username must be at least 4 characters").optional(),
});