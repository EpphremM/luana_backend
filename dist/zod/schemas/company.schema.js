"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySchema = exports.companySchema = void 0;
const zod_1 = require("zod");
// Define schema for the "company" section
const companyDetailsSchema = zod_1.z.object({
    net_earning: zod_1.z.number().positive(),
    fee_percentage: zod_1.z.number().min(0).max(100), // Assuming percentage is 0-100
});
exports.companySchema = zod_1.z.object({
    company: companyDetailsSchema,
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    username: zod_1.z.string().min(4, "Username must be at least 4 characters"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: zod_1.z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
// Update schemas
const updateCompanyDetailsSchema = zod_1.z.object({
    net_earning: zod_1.z.number().positive().optional(),
    fee_percentage: zod_1.z.number().min(-1).max(100).optional(),
});
exports.updateCompanySchema = zod_1.z.object({
    company: updateCompanyDetailsSchema.optional(),
    first_name: zod_1.z.string().min(1, "First name is required").optional(),
    last_name: zod_1.z.string().min(1, "Last name is required").optional(),
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
