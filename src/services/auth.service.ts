import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Request } from 'express';
import { AppDataSource } from '../database/data.source';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh.entity';

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

export const generateDeviceFingerprint = (req: Request): string => {
  return crypto
    .createHash('sha256')
    .update(`${req.headers['user-agent']}${req.ip}`)
    .digest('hex');
};

export const generateAccessToken = (user: User, fingerprint: string): string => {
  return jwt.sign(
    {
      userId:user.admin?.id||user.casher?.id||user.super_admin?.id || user?.super_agent?.id,
      role: user.role,
      fingerprint
    },
  "Tutoring web d0b41d4a-a424-4566-adb4-c5c742732129"!,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  const user = await userRepository.findOne({ where: { username }, relations:["casher","admin","super_admin","super_agent"]});
  if ((user?.casher||user?.admin||user?.super_admin || user?.super_agent) && (await bcrypt.compare(password, user.password))) {
    // console.log("User is not found");
    // if(user)
    return user;
  }
  return null;
};

export const createRefreshToken = async (
  user: User,
  token: string,
  fingerprint: string,
  expiresIn: number = 60 * 60 * 24 * 7 
): Promise<RefreshToken> => {
  const refreshToken = refreshTokenRepository.create({
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    deviceFingerprint: fingerprint,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
    user
  });
  return refreshTokenRepository.save(refreshToken);
};

export const findRefreshToken = async (tokenHash: string): Promise<RefreshToken | null> => {
  return refreshTokenRepository.findOne({ 
    where: { tokenHash },
    relations: ['user']
  });
};

export const revokeRefreshToken = async (token: RefreshToken): Promise<void> => {
  token.revoked = true;
  await refreshTokenRepository.save(token);
};

export const revokeAllTokensForUser = async (userId: string): Promise<void> => {
  await refreshTokenRepository.update(
    { userId, revoked: false },
    { revoked: true }
  );
};

export const loginUser = async (username: string, password: string, req: Request) => {
  const user = await validateUser(username, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const status=user?.admin?.status||user?.casher?.status || user?.super_agent?.status;
 if(status==="blocked"){
  throw new Error("Temporarily account is blocked please contact admin");
 }

  const fingerprint = generateDeviceFingerprint(req);
  const accessToken = generateAccessToken(user, fingerprint);
  const refreshToken = generateRefreshToken();

  await createRefreshToken(user, refreshToken, fingerprint);
  return {
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      userId:user.admin?.id||user.casher?.id||user.super_admin?.id,
    },
    accessToken,
    refreshToken
  };
};

export const refreshUserToken = async (refreshToken: string, fingerprint: string) => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const token = await findRefreshToken(tokenHash);
  
  if (!token || token.revoked || token.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }

  if (token.deviceFingerprint !== fingerprint) {
    throw new Error('Device mismatch');
  }

  const newAccessToken = generateAccessToken(token.user, fingerprint);
  const newRefreshToken = generateRefreshToken();

  await revokeRefreshToken(token);
  await createRefreshToken(token.user, newRefreshToken, fingerprint);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const token = await findRefreshToken(tokenHash);
  if (token) {
    await revokeRefreshToken(token);
  }
};




export const decodeToken=(token)=>{
  const decoded = jwt.verify(token,"Tutoring web d0b41d4a-a424-4566-adb4-c5c742732129");
  return decoded;
}