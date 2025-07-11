"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = void 0;
const createResponse = (status, message, payload) => {
    return {
        status,
        message,
        data: {
            payload,
        },
    };
};
exports.createResponse = createResponse;
