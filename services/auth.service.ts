// services/auth.service.ts
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AppDataSource } from '../database/data.source';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh.entity';
import { Request } from 'express';


const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

export default class AuthService {
  static generateDeviceFingerprint(req: Request): string {
    return crypto
      .createHash('sha256')
      .update(`${req.headers['user-agent']}${req.ip}`)
      .digest('hex');
  }

  static async generateAccessToken(user: User, fingerprint: string): Promise<string> {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        fingerprint
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  static async generateRefreshToken(): Promise<string> {
    return crypto.randomBytes(64).toString('hex');
  }

  static async validateUser(username: string, password: string): Promise<User | null> {
    const user = await userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  static async createRefreshToken(
    user: User,
    token: string,
    fingerprint: string,
    expiresIn: number = 60 * 60 * 24 * 7 // 7 days
  ): Promise<RefreshToken> {
    const refreshToken = refreshTokenRepository.create({
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      deviceFingerprint: fingerprint,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      user
    });
    return refreshTokenRepository.save(refreshToken);
  }

  static async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return refreshTokenRepository.findOne({ 
      where: { tokenHash },
      relations: ['user']
    });
  }

  static async revokeRefreshToken(token: RefreshToken): Promise<void> {
    token.revoked = true;
    await refreshTokenRepository.save(token);
  }

  static async revokeAllTokensForUser(userId: string): Promise<void> {
    await refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  static async login(username: string, password: string, req:Request) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const fingerprint = this.generateDeviceFingerprint(req);
    const accessToken = await this.generateAccessToken(user, fingerprint);
    const refreshToken = await this.generateRefreshToken();

    await this.createRefreshToken(user, refreshToken, fingerprint);

    return {
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken: string, fingerprint: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const token = await this.findRefreshToken(tokenHash);
    
    if (!token || token.revoked || token.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    if (token.deviceFingerprint !== fingerprint) {
      throw new Error('Device mismatch');
    }

    const newAccessToken = await this.generateAccessToken(token.user, fingerprint);
    const newRefreshToken = await this.generateRefreshToken();

    await this.revokeRefreshToken(token);
    await this.createRefreshToken(token.user, newRefreshToken, fingerprint);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const token = await this.findRefreshToken(tokenHash);
    if (token) {
      await this.revokeRefreshToken(token);
    }
  }
}