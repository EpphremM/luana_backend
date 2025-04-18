import { z } from "zod";
import { GameStatus } from "../../database/anum/game.enum";


// Schema for the winner_cards array
const winnerCardsSchema = z.array(z.number().int().positive());

// Main game schema
export const gameSchema = z.object({
  id: z.string().uuid().optional(), 
  name: z.string().min(1, "Name is required"),
  player_bet: z.number().positive("Player bet must be positive"),
  total_calls: z.number().int().nonnegative("Total calls must be a non-negative integer"),
  total_player: z.number().int().nonnegative("Total players must be a non-negative integer"),
  winner_cards: winnerCardsSchema.default([]),
  status: z.nativeEnum(GameStatus),
  is_aggregated: z.boolean().default(false),
  casher: z.string().uuid("Casher ID must be a valid UUID"), // Assuming we just need the ID for relationship
  created_at: z.date().optional() // Optional since it's auto-generated
});

export const updateGameSchema = gameSchema.partial().refine(data => {
  return Object.keys(data).length > 0;
}, {
  message: "At least one field must be provided for update",
  path: ["update"]
});

// Schema for creating a new game (without optional fields)
export const createGameSchema = gameSchema.omit({ 
  id: true, 
  created_at: true,
  is_aggregated: true 
}).extend({
  is_aggregated: z.boolean().optional().default(false)
});