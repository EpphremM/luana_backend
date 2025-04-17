import { z } from "zod";
import { PermissionStatus } from "../../database/anum/permission.enum"; 
import { userSchema } from "./user.schema";

export const casherSchema = z.object({
user:userSchema,
  status: z.nativeEnum(PermissionStatus)
    .optional()
    .default(PermissionStatus.Pemitted), 
  assigned_admin_id: z.string().uuid().optional(),
  admin_id:z.string()
}).required();

export type RegisterCasherDto = z.infer<typeof casherSchema>;