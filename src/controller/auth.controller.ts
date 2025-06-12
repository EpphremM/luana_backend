import { Request, Response,NextFunction } from 'express';
import {
  loginUser,
  refreshUserToken,
  logoutUser,
  generateDeviceFingerprint,
  decodeToken
} from '../services/auth.service';
import { createResponse } from '../express/types/response.body';
import ENV from '../config/env';
import { AppError } from '../express/error/app.error';

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

const setAuthCookies = (res:Response, accessToken: string, refreshToken: string): void => {
 const isProduction=ENV.node_env==="production";
  
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite:isProduction?"none":"lax",
    // domain: 'https://luana-bingo.vercel.app/',
    path:"/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite:isProduction?"none":"lax",
    path:"/",
    // domain: 'https://luana-bingo.vercel.app/', 
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
    const isProduction=ENV.node_env==="production";
    res.clearCookie('access_token', { httpOnly: true, secure: isProduction, sameSite:isProduction?"none":"lax" });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProduction, sameSite: isProduction?"none":"lax" });
    // if (refreshToken) {
    //   await logoutUser(refreshToken);
    // }
    res.status(200).json({success: true });
  } catch (error) {
    res.status(500).json(createResponse("fail", error instanceof Error ? error.message : 'Login failed',[]));
  }
};

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) {
      next(new AppError("No access token provided", 401, "Operational"));
      return;
    }

    const decoded = decodeToken(accessToken);
    if (!decoded || typeof decoded === "string") {
      next(new AppError("Invalid token", 401, "Operational"));
      return;
    }

    // Now TypeScript knows decoded is an object with properties
    const currentFingerprint = generateDeviceFingerprint(req);
    if (decoded.fingerprint !== currentFingerprint) {
      next(new AppError("Device mismatch", 401, "Operational"));
      return;
    }

    res.status(200).json(
      createResponse("success", "Session valid", {
        user: {
          userId: decoded.userId,
          role: decoded.role,
          fingerprint: decoded.fingerprint,
        },
      })
    );
  } catch (error) {
    next(new AppError("Validation error", 401, "Operational"));
  }
};
