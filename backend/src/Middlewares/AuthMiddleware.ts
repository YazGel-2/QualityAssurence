import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload 
{
    userId: number;
    role:   'admin' | 'user';
}

export const authenticateToken = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) 
    {
        return res.status(401).json({ error: "Access token required" });
    }

    try 
    {
        const decoded = jwt.verify(token,  process.env.JWT_SECRET as string) as JwtPayload;
        (req as any).user = decoded;
        next();
    } 
    catch (error) 
    {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

export const requireAdmin = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const user = (req as any).user as JwtPayload;

    if (!user || user.role !== 'admin') 
    {
        return res.status(403).json({ error: "Admin access required" });
    }

    next();
};