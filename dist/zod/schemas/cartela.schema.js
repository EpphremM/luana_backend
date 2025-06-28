"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCartelaSchema = exports.CartelaSchema = void 0;
const zod_1 = require("zod");
exports.CartelaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "name is required"),
});
exports.UpdateCartelaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
});
