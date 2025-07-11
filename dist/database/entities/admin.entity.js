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
exports.Admin = void 0;
const typeorm_1 = require("typeorm");
const casher_entity_1 = require("./casher.entity");
const company_entity_1 = require("./company.entity");
const permission_enum_1 = require("../enum/permission.enum");
const user_entity_1 = require("./user.entity");
const cartela_entity_1 = require("./cartela.entity");
const agent_entity_1 = require("./agent.entity");
let Admin = class Admin {
};
exports.Admin = Admin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Admin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: permission_enum_1.PermissionStatus, default: permission_enum_1.PermissionStatus.Pemitted, nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Admin.prototype, "total_earning", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "decimal", precision: 30, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Admin.prototype, "net_earning", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], Admin.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 15 }),
    __metadata("design:type", Number)
], Admin.prototype, "fee_percentage", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.admin),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Admin.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => casher_entity_1.Casher, casher => casher.admin),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], Admin.prototype, "cashers", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.SuperAdmin, super_admin => super_admin.admin),
    (0, typeorm_1.JoinColumn)({ name: "super_id" }),
    __metadata("design:type", company_entity_1.SuperAdmin)
], Admin.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cartela_entity_1.Cartela, cartela => cartela.admin),
    (0, typeorm_1.JoinColumn)({ name: "cartela_id" }),
    __metadata("design:type", cartela_entity_1.Cartela)
], Admin.prototype, "cartela", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admin, admin => admin.super_agent),
    (0, typeorm_1.JoinColumn)({ name: "super_agent_id" }),
    __metadata("design:type", agent_entity_1.SuperAgent)
], Admin.prototype, "super_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "cartela_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "super_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "super_agent_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Admin.prototype, "created_at", void 0);
exports.Admin = Admin = __decorate([
    (0, typeorm_1.Entity)("admin")
], Admin);
