import { z } from "zod"

  
export const CartelaSchema = z.object({
    name: z.string().min(1, "name is required"),
})