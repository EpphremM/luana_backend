import { z } from "zod";
import { UserRole } from "../../database/anum/role.enum";


export const UserSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6), // adjust to your password policy
  role: z.nativeEnum(UserRole),
  created_at: z.coerce.date(),
  casher: z.any().optional(),
  admin: z.any().optional(),
  super_admin: z.any().optional(),
});
