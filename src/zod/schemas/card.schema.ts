import { z } from "zod";

export const CardSchema = z.object({
  cards: z.array(
    z.array(
      z.number()
        .min(1, { message: "All cells must contain numbers (center can be 0)" })
        .or(z.literal(0)) 
    ).length(5)
  ).length(5)
  .refine(cards => {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (row === 2 && col === 2) continue;
        
        if (cards[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }, {
    message: "All cells must contain numbers (only center can be 0)",
    path: ["cards"]
  })
  .refine(cards => {

    const columnRanges = [
      { min: 1, max: 15 },   
      { min: 16, max: 30 }, 
      { min: 31, max: 45 },
      { min: 46, max: 60 }, 
      { min: 61, max: 75 }  
    ];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const value = cards[row][col];
        if (value === 0 && !(row === 2 && col === 2)) {
          return false;
        }
        
        if (value !== 0 && (value < columnRanges[col].min || value > columnRanges[col].max)) {
          return false;
        }
      }
    }
    return true;
  }, {
    message: "Numbers must be in their column ranges (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)",
    path: ["cards"]
  })
  .refine(cards => {
    // Center cell validation
    const centerValue = cards[2][2];
    return centerValue === 0 || (centerValue >= 31 && centerValue <= 45);
  }, {
    message: "Center position (N) must be 0 or between 31-45",
    path: ["cards", 2, 2]
  })
  .refine(cards => {
    // Global uniqueness check (excluding zeros)
    const allNumbers = cards.flat().filter(num => num !== 0);
    return new Set(allNumbers).size === allNumbers.length;
  }, {
    message: "All numbers must be unique across the entire card (excluding zeros)",
    path: ["cards"]
  })})
export const UpdateCardSchema=z.object({
  cards: z.array(
    z.array(
      z.number()
        .min(1, { message: "All cells must contain numbers (center can be 0)" })
        .or(z.literal(0)) 
    ).length(5)
  ).length(5)
  .refine(cards => {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (row === 2 && col === 2) continue;
        
        if (cards[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }, {
    message: "All cells must contain numbers (only center can be 0)",
    path: ["cards"]
  })
  .refine(cards => {

    const columnRanges = [
      { min: 1, max: 15 },   
      { min: 16, max: 30 }, 
      { min: 31, max: 45 },
      { min: 46, max: 60 }, 
      { min: 61, max: 75 }  
    ];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const value = cards[row][col];
        if (value === 0 && !(row === 2 && col === 2)) {
          return false;
        }
        
        if (value !== 0 && (value < columnRanges[col].min || value > columnRanges[col].max)) {
          return false;
        }
      }
    }
    return true;
  }, {
    message: "Numbers must be in their column ranges (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)",
    path: ["cards"]
  })
  .refine(cards => {
    // Center cell validation
    const centerValue = cards[2][2];
    return centerValue === 0 || (centerValue >= 31 && centerValue <= 45);
  }, {
    message: "Center position (N) must be 0 or between 31-45",
    path: ["cards", 2, 2]
  })
  .refine(cards => {
    // Global uniqueness check (excluding zeros)
    const allNumbers = cards.flat().filter(num => num !== 0);
    return new Set(allNumbers).size === allNumbers.length;
  }, {
    message: "All numbers must be unique across the entire card (excluding zeros)",
    path: ["cards"]
  }).optional()
})