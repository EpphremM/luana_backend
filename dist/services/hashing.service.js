"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = async (password) => {
    const saltRound = 15;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRound);
    return hashedPassword;
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt_1.default.compare(password, hash);
    }
    catch (error) {
        console.error('Password verification error:', error);
        throw new Error('Password verification failed');
    }
};
exports.verifyPassword = verifyPassword;
