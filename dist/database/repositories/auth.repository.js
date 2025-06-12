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
exports.AuthRepository = void 0;
const data_source_1 = require("../data.source");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const refresh_entity_1 = require("../entities/refresh.entity");
class AuthRepository {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
        this.refreshTokenRepository = data_source_1.AppDataSource.getRepository(refresh_entity_1.RefreshToken);
    }
    async createUser(userData) {
        const user = this.userRepository.create(userData);
        user.password = await bcrypt.hash(userData.password, 10);
        return this.userRepository.save(user);
    }
    async validateUser(username, password) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
    async createRefreshToken(user, token, fingerprint, expiresIn) {
        const refreshToken = this.refreshTokenRepository.create({
            tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
            deviceFingerprint: fingerprint,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            user
        });
        return this.refreshTokenRepository.save(refreshToken);
    }
    async findRefreshToken(tokenHash) {
        return this.refreshTokenRepository.findOne({
            where: { tokenHash },
            relations: ["user"]
        });
    }
    async revokeRefreshToken(token) {
        token.revoked = true;
        await this.refreshTokenRepository.save(token);
    }
    async revokeAllTokensForUser(userId) {
        await this.refreshTokenRepository.update({ userId, revoked: false }, { revoked: true });
    }
}
exports.AuthRepository = AuthRepository;
