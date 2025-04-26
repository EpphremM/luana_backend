import { Request, Response,NextFunction } from 'express';
import {
  loginUser,
  refreshUserToken,
  logoutUser,
  generateDeviceFingerprint,
  decodeToken
} from '../services/auth.service';
import { createResponse } from '../express/types/response.body';

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

const setAuthCookies = (res, accessToken: string, refreshToken: string): void => {
 
  
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite:"None",
    // domain: '.vercel.app',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite:"None",
    // domain: '.vercel.app', 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password, req);
    console.log("Login result is",result);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    console.log(result.accessToken);
    
    res.json(createResponse("success","User logged in successfully",result.user));
  } catch (error) {
    console.log(error);
    res.status(401).json(createResponse("fail", error instanceof Error ? error.message : 'Login failed',[]));
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
    res.status(401).json(createResponse("fail", error instanceof Error ? error.message : 'Token refresh failed',[]));
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
    res.status(500).json(createResponse("fail", error instanceof Error ? error.message : 'Login failed',[]));
  }
};

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check for access token in cookies
    const accessToken = req.cookies['access_token'];
    // console.log(accessToken);
    if (!accessToken) {
      res.status(401).json(
        createResponse("fail", "No access token provided", [])
      );
      return; // Explicit return
    }

    // 2. Verify and decode the token
    const decoded = decodeToken(accessToken);
    if (!decoded) {
      res.status(401).json(
        createResponse("fail", "Invalid token", [])
      );
      return;
    }

    // 3. Verify device fingerprint matches
    const currentFingerprint = generateDeviceFingerprint(req);
    if (decoded.fingerprint !== currentFingerprint) {
      res.status(401).json(
        createResponse("fail", "Device mismatch", [])
      );
      return;
    }

    // 4. If all checks pass, return success with user data
    res.status(200).json(
      createResponse("success", "Session valid", {
        user: {
          userId: decoded.userId,
          role: decoded.role,
          fingerprint: decoded.fingerprint
        }
      })
    );

  } catch (error) {
    res.status(401).json(
      createResponse("fail", error instanceof Error ? error.message : "Session validation failed", [])
    );
  }
};