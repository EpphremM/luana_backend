import { Request, Response } from 'express';
import {
  loginUser,
  refreshUserToken,
  logoutUser,
  generateDeviceFingerprint
} from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        fingerprint: string;
      };
    }
  }
}

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password, req);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const fingerprint = generateDeviceFingerprint(req);
    const result = await refreshUserToken(refreshToken, fingerprint);
    
    setAuthCookies(res, result.accessToken, result.refreshToken);
    
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed'
    });
  }
};