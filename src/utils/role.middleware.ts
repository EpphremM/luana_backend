import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { generateDeviceFingerprint } from '../services/auth.service';
import { UserRole } from '../database/anum/role.enum';



export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    try {
      const token = req.cookies['access_token'] || req.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: UserRole;
        fingerprint: string;
      };

      if (!rolesArray.includes(decoded.role)) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      const fingerprint = generateDeviceFingerprint(req);
      if (decoded.fingerprint !== fingerprint) {
        res.status(401).json({ message: 'Device mismatch' });
        return;
      }

      req.user = decoded;
      next(); // Properly continue to next middleware
    } catch (error) {
      res.status(401).json({ 
        message: error instanceof Error ? error.message : 'Invalid token' 
      });
    }
  };
};