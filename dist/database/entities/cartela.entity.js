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
exports.Cartela = void 0;
const typeorm_1 = require("typeorm");
const card_entity_1 = require("./card.entity");
const admin_entity_1 = require("./admin.entity");
let Cartela = class Cartela {
};
exports.Cartela = Cartela;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Cartela.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cartela.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => card_entity_1.Card, card => card.cartela),
    __metadata("design:type", Array)
], Cartela.prototype, "cards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => admin_entity_1.Admin, admin => admin.cartela),
    __metadata("design:type", Array)
], Cartela.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Cartela.prototype, "created_at", void 0);
exports.Cartela = Cartela = __decorate([
    (0, typeorm_1.Entity)("cartela")
], Cartela);
