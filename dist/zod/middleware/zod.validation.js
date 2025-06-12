"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = void 0;
const app_error_1 = require("../../express/error/app.error");
const validateInput = async (schema, body) => {
    try {
        const result = await schema.safeParseAsync(body);
        if (result.success) {
            const status = {
                status: "success",
                data: result.data
            };
            return status;
        }
        else {
            const errors = result.error.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message
            }));
            const status = {
                status: "fail",
                errors
            };
            return status;
        }
    }
    catch (error) {
        new app_error_1.AppError("Validation error", 400, "Operational", error);
    }
};
exports.validateInput = validateInput;
