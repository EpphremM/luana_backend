"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    phone: zod_1.z.string().trim().min(9).max(13).refine((value) => {
        const regex = /^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
        return regex.test(value);
    }, {
        message: "invalid phone number format"
    }),
    username: zod_1.z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters"),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
});
