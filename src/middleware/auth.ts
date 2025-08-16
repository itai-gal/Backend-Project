import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

type TokenPayload = {
    userId: string;
    isBusiness: boolean;
    isAdmin: boolean;
    iat?: number;
    exp?: number;
};

export default function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = header.substring("Bearer ".length).trim();
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        // מצמידים את פרטי המשתמש לבקשה
        (req as any).user = {
            userId: decoded.userId,
            isBusiness: decoded.isBusiness,
            isAdmin: decoded.isAdmin,
        };

        return next();
    } catch (err: any) {
        // תוקף פג / טוקן לא חוקי
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
