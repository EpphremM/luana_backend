// repositories/auth.repository.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../data.source";
import { User } from "../entities/user.entity";

import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { RefreshToken } from "../entities/refresh.entity";

export class AuthRepository {
    private userRepository = AppDataSource.getRepository(User);
    private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        user.password = await bcrypt.hash(userData.password, 10);
        return this.userRepository.save(user);
    }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }

    async createRefreshToken(user: User, token: string, fingerprint: string, expiresIn: number): Promise<RefreshToken> {
        const refreshToken = this.refreshTokenRepository.create({
            tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
            deviceFingerprint: fingerprint,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            user
        });
        return this.refreshTokenRepository.save(refreshToken);
    }

    async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepository.findOne({ 
            where: { tokenHash },
            relations: ["user"]
        });
    }

    async revokeRefreshToken(token: RefreshToken): Promise<void> {
        token.revoked = true;
        await this.refreshTokenRepository.save(token);
    }

    async revokeAllTokensForUser(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, revoked: false },
            { revoked: true }
        );
    }
}