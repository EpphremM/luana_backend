"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameSchema = exports.updateGameSchema = exports.gameSchema = void 0;
const zod_1 = require("zod");
const game_enum_1 = require("../../database/enum/game.enum");
const winnerCardsSchema = zod_1.z.array(zod_1.z.number().int().positive());
exports.gameSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    player_bet: zod_1.z.number().positive("Player bet must be positive"),
    total_calls: zod_1.z.number().int().nonnegative("Total calls must be a non-negative integer"),
    total_player: zod_1.z.number().int().nonnegative("Total players must be a non-negative integer"),
    winner_cards: winnerCardsSchema.default([]),
    status: zod_1.z.nativeEnum(game_enum_1.GameStatus).optional(),
    is_aggregated: zod_1.z.boolean().default(false),
    casher: zod_1.z.string().uuid("Casher ID must be a valid UUID").optional(),
    created_at: zod_1.z.date().optional(),
    casher_id: zod_1.z.number().optional()
});
exports.updateGameSchema = exports.gameSchema.partial().refine(data => {
    return Object.keys(data).length > 0;
}, {
    message: "At least one field must be provided for update",
    path: ["update"]
});
exports.createGameSchema = exports.gameSchema.omit({
    created_at: true,
    is_aggregated: true
}).extend({
    is_aggregated: zod_1.z.boolean().optional().default(false)
});
