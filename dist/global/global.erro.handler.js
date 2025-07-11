"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    if (res.headersSent) {
        return next(err);
    }
    const status = "fail";
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const name = err.name || "Operational";
    const errorDetails = err.stack || null;
    res.status(statusCode).json({
        status,
        message,
        name,
        error: errorDetails,
    });
};
exports.globalErrorHandler = globalErrorHandler;
