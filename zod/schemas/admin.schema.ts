import { z } from "zod";
import { userSchema } from "./user.schema";
import { PermissionStatus } from "../../database/anum/permission.enum";

export const adminSchema = z.object({
  user: userSchema,
  id:z.string(),
  company: z.object({
    net_earning: z.number()
      .min(0, "Net earnings cannot be negative")
      .default(0), 
    fee_percentage: z.number()
      .min(0, "Fee percentage cannot be negative")
      .max(100, "Fee percentage cannot exceed 100%")
      .default(15), 
  }),
  status: z.nativeEnum(PermissionStatus)
    .optional()
    .default(PermissionStatus.Pemitted),

}).required();

