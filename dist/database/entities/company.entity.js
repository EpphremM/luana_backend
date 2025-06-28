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
exports.SuperAdmin = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const admin_entity_1 = require("./admin.entity");
let SuperAdmin = class SuperAdmin {
};
exports.SuperAdmin = SuperAdmin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], SuperAdmin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "decimal", precision: 30, scale: 2 }),
    __metadata("design:type", Number)
], SuperAdmin.prototype, "net_earning", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 15 }),
    __metadata("design:type", Number)
], SuperAdmin.prototype, "fee_percentage", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => admin_entity_1.Admin, admin => admin.company, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", Array)
], SuperAdmin.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.super_admin, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], SuperAdmin.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SuperAdmin.prototype, "created_at", void 0);
exports.SuperAdmin = SuperAdmin = __decorate([
    (0, typeorm_1.Entity)("company")
], SuperAdmin);
