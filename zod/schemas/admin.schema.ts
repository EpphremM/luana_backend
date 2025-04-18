import { z } from "zod";
import { userSchema } from "./user.schema"; 
import { PermissionStatus } from "../../database/anum/permission.enum";

// Define schema for the "admin" section
const adminDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).default(PermissionStatus.Pemitted),
  wallet: z.number().positive(),
  total_earning: z.number(), 
  net_earning: z.number(), 
  package: z.number().positive(),
});



export const adminSchema = z.object({
  admin: adminDetailsSchema,
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});
const updateAdminDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).default(PermissionStatus.Pemitted).optional(),
  wallet: z.number().positive().optional(),
  total_earning: z.number().optional(), 
  net_earning: z.number().optional(), 
  package: z.number().positive().optional(),
});


export const updateAdminSchema = z.object({
  admin: updateAdminDetailsSchema.optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(4, "Username must be at least 4 characters").optional(),
})
