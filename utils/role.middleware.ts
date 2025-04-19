import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { generateDeviceFingerprint } from '../services/auth.service';
import { UserRole } from '../database/anum/role.enum';



export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies['access_token'] || req.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: UserRole;
        fingerprint: string;
      };

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const fingerprint = generateDeviceFingerprint(req);
      if (decoded.fingerprint !== fingerprint) {
        return res.status(401).json({ message: 'Device mismatch' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: error instanceof Error ? error.message : 'Invalid token' 
      });
    }
  };
};