import { z } from "zod";
import { PermissionStatus } from "../../database/enum/permission.enum";

// SuperAgent-specific details schema
const superAgentDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).default(PermissionStatus.Pemitted),
  package: z.number().positive(),
});
export const superAgentSchema = z.object({
  super_agent: superAgentDetailsSchema,
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
  phone: z.string().trim().min(9).max(13).refine((value) => {
    const regex = /^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
    return regex.test(value);
  }, {
    message: "Invalid phone number format"
  })
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
const updateSuperAgentDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).optional(),
  package: z.number().positive().optional(),
});

export const updateSuperAgentSchema = z.object({
  super_agent: updateSuperAgentDetailsSchema.optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(4, "Username must be at least 4 characters").optional(),
  phone: z.string().trim().min(9).max(13).refine((value) => {
    const regex = /^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
    return regex.test(value);
  }, {
    message: "Invalid phone number format"
  }).optional(),
  fee_percentage: z.number().positive().optional(),
  password: z.string().min(8).optional(),
  confirm_password: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
