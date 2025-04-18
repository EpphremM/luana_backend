import { z } from "zod";
import { PermissionStatus } from "../../database/anum/permission.enum";

const casherDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).default(PermissionStatus.Pemitted),
  admin_id:z.string()
});

export const casherSchema = z.object({
  casher: casherDetailsSchema,
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"), 
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const updateCasherSchema = z.object({
  casher: casherDetailsSchema.partial().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  username: z.string().min(4).optional(),
});