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
exports.Casher = void 0;
const typeorm_1 = require("typeorm");
const permission_enum_1 = require("../enum/permission.enum");
const user_entity_1 = require("./user.entity");
const admin_entity_1 = require("./admin.entity");
const game_entity_1 = require("./game.entity");
let Casher = class Casher {
};
exports.Casher = Casher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Casher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: permission_enum_1.PermissionStatus, default: permission_enum_1.PermissionStatus.Pemitted }),
    __metadata("design:type", String)
], Casher.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, admin => admin.cashers, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "admin_id" }),
    __metadata("design:type", admin_entity_1.Admin)
], Casher.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => game_entity_1.Game, game => game.casher),
    __metadata("design:type", Array)
], Casher.prototype, "game", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.casher),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Casher.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Casher.prototype, "admin_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Casher.prototype, "created_at", void 0);
exports.Casher = Casher = __decorate([
    (0, typeorm_1.Entity)("casher")
], Casher);
