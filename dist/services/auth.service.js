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
exports.decodeToken = exports.logoutUser = exports.refreshUserToken = exports.loginUser = exports.revokeAllTokensForUser = exports.revokeRefreshToken = exports.findRefreshToken = exports.createRefreshToken = exports.validateUser = exports.generateRefreshToken = exports.generateAccessToken = exports.generateDeviceFingerprint = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const data_source_1 = require("../database/data.source");
const user_entity_1 = require("../database/entities/user.entity");
const refresh_entity_1 = require("../database/entities/refresh.entity");
const userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
const refreshTokenRepository = data_source_1.AppDataSource.getRepository(refresh_entity_1.RefreshToken);
const generateDeviceFingerprint = (req) => {
    return crypto
        .createHash('sha256')
        .update(`${req.headers['user-agent']}${req.ip}`)
        .digest('hex');
};
exports.generateDeviceFingerprint = generateDeviceFingerprint;
const generateAccessToken = (user, fingerprint) => {
    return jwt.sign({
        userId: user.admin?.id || user.casher?.id || user.super_admin?.id || user?.super_agent?.id,
        role: user.role,
        fingerprint
    }, "Tutoring web d0b41d4a-a424-4566-adb4-c5c742732129", { expiresIn: '1h' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};
exports.generateRefreshToken = generateRefreshToken;
const validateUser = async (username, password) => {
    const user = await userRepository.findOne({ where: { username }, relations: ["casher", "admin", "super_admin", "super_agent"] });
    if ((user?.casher || user?.admin || user?.super_admin || user?.super_agent) && (await bcrypt.compare(password, user.password))) {
        // console.log("User is not found");
        // if(user)
        return user;
    }
    return null;
};
exports.validateUser = validateUser;
const createRefreshToken = async (user, token, fingerprint, expiresIn = 60 * 60 * 24 * 7) => {
    const refreshToken = refreshTokenRepository.create({
        tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
        deviceFingerprint: fingerprint,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        user
    });
    return refreshTokenRepository.save(refreshToken);
};
exports.createRefreshToken = createRefreshToken;
const findRefreshToken = async (tokenHash) => {
    return refreshTokenRepository.findOne({
        where: { tokenHash },
        relations: ['user']
    });
};
exports.findRefreshToken = findRefreshToken;
const revokeRefreshToken = async (token) => {
    token.revoked = true;
    await refreshTokenRepository.save(token);
};
exports.revokeRefreshToken = revokeRefreshToken;
const revokeAllTokensForUser = async (userId) => {
    await refreshTokenRepository.update({ userId, revoked: false }, { revoked: true });
};
exports.revokeAllTokensForUser = revokeAllTokensForUser;
const loginUser = async (username, password, req) => {
    const user = await (0, exports.validateUser)(username, password);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const status = user?.admin?.status || user?.casher?.status || user?.super_agent?.status;
    if (status === "blocked") {
        throw new Error("Temporarily account is blocked please contact admin");
    }
    const fingerprint = (0, exports.generateDeviceFingerprint)(req);
    const accessToken = (0, exports.generateAccessToken)(user, fingerprint);
    const refreshToken = (0, exports.generateRefreshToken)();
    await (0, exports.createRefreshToken)(user, refreshToken, fingerprint);
    return {
        user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            userId: user.admin?.id || user.casher?.id || user.super_admin?.id,
        },
        accessToken,
        refreshToken
    };
};
exports.loginUser = loginUser;
const refreshUserToken = async (refreshToken, fingerprint) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const token = await (0, exports.findRefreshToken)(tokenHash);
    if (!token || token.revoked || token.expiresAt < new Date()) {
        throw new Error('Invalid refresh token');
    }
    if (token.deviceFingerprint !== fingerprint) {
        throw new Error('Device mismatch');
    }
    const newAccessToken = (0, exports.generateAccessToken)(token.user, fingerprint);
    const newRefreshToken = (0, exports.generateRefreshToken)();
    await (0, exports.revokeRefreshToken)(token);
    await (0, exports.createRefreshToken)(token.user, newRefreshToken, fingerprint);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};
exports.refreshUserToken = refreshUserToken;
const logoutUser = async (refreshToken) => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const token = await (0, exports.findRefreshToken)(tokenHash);
    if (token) {
        await (0, exports.revokeRefreshToken)(token);
    }
};
exports.logoutUser = logoutUser;
const decodeToken = (token) => {
    const decoded = jwt.verify(token, "Tutoring web d0b41d4a-a424-4566-adb4-c5c742732129");
    return decoded;
};
exports.decodeToken = decodeToken;
