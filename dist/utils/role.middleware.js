"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const auth_service_1 = require("../services/auth.service");
const requireRole = (roles) => {
    return (req, res, next) => {
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        try {
            const token = req.cookies['access_token'] || req.headers['authorization']?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, "Tutoring web d0b41d4a-a424-4566-adb4-c5c742732129");
            if (!rolesArray.includes(decoded.role)) {
                res.status(403).json({ message: 'Insufficient permissions' });
                return;
            }
            const fingerprint = (0, auth_service_1.generateDeviceFingerprint)(req);
            if (decoded.fingerprint !== fingerprint) {
                res.status(401).json({ message: 'Device mismatch' });
                return;
            }
            req.user = decoded;
            next(); // Properly continue to next middleware
        }
        catch (error) {
            res.status(401).json({
                message: error instanceof Error ? error.message : 'Invalid token'
            });
        }
    };
};
exports.requireRole = requireRole;
