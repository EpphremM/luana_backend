import { z } from "zod";
const columnRange = (min: number, max: number) =>
    z.number().min(min).max(max);
export const CardSchema=z.object({
    cards: z.array(z.tuple([columnRange(1, 15),columnRange(16, 30),columnRange(31, 45),columnRange(46, 60),columnRange(61, 75)],{message:"Invalid cartela format"})
).length(5)
})