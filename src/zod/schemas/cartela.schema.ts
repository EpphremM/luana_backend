import { z } from "zod"

  
export const CartelaSchema = z.object({
    name: z.string().min(1, "name is required"),
})

export const UpdateCartelaSchema = z.object({
    name: z.string().min(1).optional(),
})