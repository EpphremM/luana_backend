"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminSchema = exports.adminSchema = void 0;
const zod_1 = require("zod");
const permission_enum_1 = require("../../database/enum/permission.enum");
const adminDetailsSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(permission_enum_1.PermissionStatus).default(permission_enum_1.PermissionStatus.Pemitted),
    total_earning: zod_1.z.number().optional(),
    net_earning: zod_1.z.number().optional(),
    package: zod_1.z.number().positive(),
});
exports.adminSchema = zod_1.z.object({
    admin: adminDetailsSchema,
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    username: zod_1.z.string().min(4, "Username must be at least 4 characters"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: zod_1.z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
const updateAdminDetailsSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(permission_enum_1.PermissionStatus).default(permission_enum_1.PermissionStatus.Pemitted).optional(),
    total_earning: zod_1.z.number().optional(),
    net_earning: zod_1.z.number().optional(),
    package: zod_1.z.number().positive().optional(),
    fee_percentage: zod_1.z.number().positive().optional(),
});
exports.updateAdminSchema = zod_1.z.object({
    admin: updateAdminDetailsSchema.optional(),
    first_name: zod_1.z.string().min(1, "First name is required").optional(),
    last_name: zod_1.z.string().min(1, "Last name is required").optional(),
    username: zod_1.z.string().min(4, "Username must be at least 4 characters").optional(),
    phone: zod_1.z.string().trim().min(9).max(13).refine((value) => {
        const regex = /^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
        return regex.test(value);
    }, {
        message: "invalid phone number format"
    }).optional(),
    password: zod_1.z.string().min(8).optional(),
    confirm_password: zod_1.z.string().optional(),
})
    .refine((data) => !data.password || data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});
