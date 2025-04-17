import { z } from "zod";
import { userSchema } from "./user.schema";

export const superAdminSchema = z.object({
  user: userSchema,
    net_earning: z.number()
      .min(0, "Net earnings cannot be negative")
      .default(0), 
    fee_percentage: z.number()
      .min(0, "Fee percentage cannot be negative")
      .max(100, "Fee percentage cannot exceed 100%")
      .default(15), 

}).required();
