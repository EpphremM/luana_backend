"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const typeorm_1 = require("typeorm");
const game_enum_1 = require("../enum/game.enum");
const casher_entity_1 = require("./casher.entity");
let Game = class Game {
};
exports.Game = Game;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Game.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Game.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Game.prototype, "player_bet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Game.prototype, "total_calls", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Game.prototype, "total_player", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: [] }),
    __metadata("design:type", Array)
], Game.prototype, "winner_cards", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Game.prototype, "derash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: game_enum_1.GameStatus, default: game_enum_1.GameStatus.Playing }),
    __metadata("design:type", String)
], Game.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isPreset", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: true }),
    __metadata("design:type", Boolean)
], Game.prototype, "isSpecial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isCommon", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Game.prototype, "isFifteen", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Game.prototype, "admin_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 10, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Game.prototype, "deduction_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Game.prototype, "company_comission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => casher_entity_1.Casher, casher => casher.game, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "casher_id" }),
    __metadata("design:type", casher_entity_1.Casher)
], Game.prototype, "casher", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Game.prototype, "casher_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Game.prototype, "created_at", void 0);
exports.Game = Game = __decorate([
    (0, typeorm_1.Entity)("game")
], Game);
