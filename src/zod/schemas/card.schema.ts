import { z } from "zod";

const columnRange = (min: number, max: number) =>
  z.number().min(min).max(max);

export const CardSchema = z.object({
  cards: z.array(
    z.array(
      z.number()
    ).length(5)
  ).length(5)
  .refine(cards => {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const value = cards[row][col];
        if (row === 2 && col === 2) continue;
        if (col === 0 && (value < 1 || value > 15)) return false;
        if (col === 1 && (value < 16 || value > 30)) return false;
        if (col === 2 && (value < 31 || value > 45)) return false;
        if (col === 3 && (value < 46 || value > 60)) return false;
        if (col === 4 && (value < 61 || value > 75)) return false;
      }
    }
    return true;
  }, {
    message: "Numbers must be in their column ranges (B:1-15, I:16-30, N:31-45/0, G:46-60, O:61-75)"
  })
  .refine(cards => {
    // Special validation for center position
    const centerValue = cards[2][2];
    return centerValue === 0 || (centerValue >= 31 && centerValue <= 45);
  }, {
    message: "Center position (N) must be 0 or between 31-45",
    path: ["cards", 2, 2]
  })
});
export const UpdateCardSchema=z.object({
    cards: z.array(z.tuple([columnRange(1, 15),columnRange(16, 30),columnRange(31, 45),columnRange(46, 60),columnRange(61, 75)],{message:"Invalid cartela format"})
).length(5).optional()
})