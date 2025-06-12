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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const role_enum_1 = require("../enum/role.enum"); // Enum for user roles
const casher_entity_1 = require("./casher.entity");
const admin_entity_1 = require("./admin.entity");
const company_entity_1 = require("./company.entity");
const refresh_entity_1 = require("./refresh.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: role_enum_1.UserRole }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => casher_entity_1.Casher, casher => casher.user, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", casher_entity_1.Casher)
], User.prototype, "casher", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => admin_entity_1.Admin, admin => admin.user, { cascade: true }),
    __metadata("design:type", admin_entity_1.Admin)
], User.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => refresh_entity_1.RefreshToken, (token) => token.user, { onDelete: "CASCADE", onUpdate: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => company_entity_1.SuperAdmin, superr => superr.user, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", company_entity_1.SuperAdmin)
], User.prototype, "super_admin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("user")
], User);
