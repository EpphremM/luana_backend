"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCasherSchema = exports.casherSchema = void 0;
const zod_1 = require("zod");
const permission_enum_1 = require("../../database/enum/permission.enum");
const casherDetailsSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(permission_enum_1.PermissionStatus).default(permission_enum_1.PermissionStatus.Pemitted),
    admin_id: zod_1.z.number()
});
exports.casherSchema = zod_1.z.object({
    casher: casherDetailsSchema,
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    username: zod_1.z.string().min(4, "Username must be at least 4 characters"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: zod_1.z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
exports.updateCasherSchema = zod_1.z.object({
    casher: casherDetailsSchema.partial().optional(),
    first_name: zod_1.z.string().min(1).optional(),
    last_name: zod_1.z.string().min(1).optional(),
    username: zod_1.z.string().min(4).optional(),
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
