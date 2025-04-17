import { z } from "zod";
import { userSchema } from "./user.schema";
import { PermissionStatus } from "../../database/anum/permission.enum";

export const adminSchema = z.object({
  // user: userSchema,
  status: z.nativeEnum(PermissionStatus)
    .optional()
    .default(PermissionStatus.Pemitted),


}).required();

