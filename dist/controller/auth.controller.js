"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = exports.validateSession = exports.logout = exports.refresh = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const response_body_1 = require("../express/types/response.body");
const env_1 = __importDefault(require("../config/env"));
const app_error_1 = require("../express/error/app.error");
const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = env_1.default.node_env === "production";
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await (0, auth_service_1.loginUser)(username, password, req);
        console.log("Login result is", result);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        console.log(result.accessToken);
        res.json((0, response_body_1.createResponse)("success", "User logged in successfully", result.user));
    }
    catch (error) {
        console.log(error);
        res.status(401).json((0, response_body_1.createResponse)("fail", error instanceof Error ? error.message : 'Login failed', []));
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new Error('No refresh token provided');
        }
        const fingerprint = (0, auth_service_1.generateDeviceFingerprint)(req);
        const result = await (0, auth_service_1.refreshUserToken)(refreshToken, fingerprint);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        res.json({ success: true });
    }
    catch (error) {
        res.status(401).json((0, response_body_1.createResponse)("fail", error instanceof Error ? error.message : 'Token refresh failed', []));
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies['refresh_token'];
        const isProduction = env_1.default.node_env === "production";
        res.clearCookie('access_token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" });
        res.clearCookie('refresh_token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" });
        // if (refreshToken) {
        //   await logoutUser(refreshToken);
        // }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json((0, response_body_1.createResponse)("fail", error instanceof Error ? error.message : 'Login failed', []));
    }
};
exports.logout = logout;
const validateSession = async (req, res, next) => {
    try {
        const accessToken = req.cookies['access_token'];
        if (!accessToken) {
            next(new app_error_1.AppError("No access token provided", 401, "Operational"));
            return;
        }
        const decoded = (0, auth_service_1.decodeToken)(accessToken);
        if (!decoded || typeof decoded === "string") {
            next(new app_error_1.AppError("Invalid token", 401, "Operational"));
            return;
        }
        const currentFingerprint = (0, auth_service_1.generateDeviceFingerprint)(req);
        if (decoded.fingerprint !== currentFingerprint) {
            next(new app_error_1.AppError("Device mismatch", 401, "Operational"));
            return;
        }
        console.log("User from validation session is", decoded);
        res.status(200).json((0, response_body_1.createResponse)("success", "Session valid", {
            user: {
                userId: decoded.userId,
                role: decoded.role,
                fingerprint: decoded.fingerprint,
            },
        }));
    }
    catch (error) {
        next(new app_error_1.AppError("Validation error", 401, "Operational"));
    }
};
exports.validateSession = validateSession;
const ping = (req, res) => {
    res.status(200).json({
        status: "success",
        message: "server is running",
    });
};
exports.ping = ping;
