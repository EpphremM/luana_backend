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
exports.SuperAgent = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
const permission_enum_1 = require("../enum/permission.enum");
const user_entity_1 = require("./user.entity");
const admin_entity_1 = require("./admin.entity");
let SuperAgent = class SuperAgent {
};
exports.SuperAgent = SuperAgent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], SuperAgent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: permission_enum_1.PermissionStatus, default: permission_enum_1.PermissionStatus.Pemitted, nullable: true }),
    __metadata("design:type", String)
], SuperAgent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], SuperAgent.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.admin),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], SuperAgent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.SuperAdmin, super_admin => super_admin.admin),
    (0, typeorm_1.JoinColumn)({ name: "super_id" }),
    __metadata("design:type", company_entity_1.SuperAdmin)
], SuperAgent.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => admin_entity_1.Admin, admin => admin.super_agent),
    __metadata("design:type", Array)
], SuperAgent.prototype, "admins", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], SuperAgent.prototype, "fee_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SuperAgent.prototype, "super_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SuperAgent.prototype, "created_at", void 0);
exports.SuperAgent = SuperAgent = __decorate([
    (0, typeorm_1.Entity)("super-agent")
], SuperAgent);
