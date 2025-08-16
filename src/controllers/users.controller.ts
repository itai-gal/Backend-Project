import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";
import { User } from "../models/user.model";
import type { IUser } from "../models/user.model";
import { signToken } from "../utils/jwt";

/** מה שמוזרק ע"י auth middleware */
type AuthUser = {
    userId: string;
    isBusiness: boolean;
    isAdmin: boolean;
};

/** עוזר: אני עצמי או אדמין (מקבל את ה-auth שנשלף מה-req) */
function isSelfOrAdmin(auth: AuthUser | undefined, targetUserId: string) {
    return Boolean(auth?.isAdmin) || auth?.userId === targetUserId;
}

/** מסיר שדות שאסור לעדכן ב- PUT */
function stripForbiddenUserFields(body: any) {
    const clone = { ...body };
    delete clone.password;
    delete clone.isAdmin;
    delete clone.email;       // אם תרצה לאפשר שינוי Email – הסר שורה זו והוסף ולידציה ייעודית
    delete clone.isBusiness;  // שינוי סטטוס עסקי נעשה ב-PATCH ייעודי
    return clone;
}

/**
 * POST /api/users
 * Register new user
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, password, image, address, isBusiness } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phone,
            email,
            password: hashed,
            image,
            address,
            isBusiness: Boolean(isBusiness),
            isAdmin: false,
        });

        // ה־schema דואג שלא יוחזר password (select:false + toJSON transform)
        return res.status(201).json(user);
    } catch (err: any) {
        console.error("registerUser error:", err?.message || err);
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * POST /api/users/login
 * Login (email + password) → JWT
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = (await User.findOne({ email }).select("+password")) as
            | HydratedDocument<IUser>
            | null;

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = signToken(
            {
                userId: user.id, // getter של מונגוס (string)
                isBusiness: user.isBusiness,
                isAdmin: user.isAdmin,
            },
            { expiresIn: "7d" }
        );

        return res.json({ token });
    } catch (err: any) {
        console.error("loginUser error:", err?.message || err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/users
 * Admin only – get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).user as AuthUser | undefined;
        if (!auth?.isAdmin) {
            return res.status(403).json({ message: "Admin only" });
        }
        const users = await User.find();
        return res.json(users);
    } catch (err: any) {
        console.error("getAllUsers error:", err?.message || err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/users/:id
 * Self or Admin – get single user
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const auth = (req as any).user as AuthUser | undefined;

        if (!isSelfOrAdmin(auth, id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json(user);
    } catch (err: any) {
        console.error("getUserById error:", err?.message || err);
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PUT /api/users/:id
 * Self – full update (ללא שינוי סיסמה/אימייל/סטטוסים)
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const auth = (req as any).user as AuthUser | undefined;

        if (!isSelfOrAdmin(auth, id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!auth?.isAdmin && auth?.userId !== id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const payload = stripForbiddenUserFields(req.body);

        const updated = await User.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        });
        if (!updated) return res.status(404).json({ message: "User not found" });

        return res.json(updated);
    } catch (err: any) {
        console.error("updateUser error:", err?.message || err);
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PATCH /api/users/:id
 * Self – toggle/set isBusiness
 * Body: { isBusiness: boolean }
 */
export const toggleBusiness = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const auth = (req as any).user as AuthUser | undefined;

        if (!isSelfOrAdmin(auth, id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!auth?.isAdmin && auth?.userId !== id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { isBusiness } = req.body as { isBusiness: boolean };
        if (typeof isBusiness !== "boolean") {
            return res.status(400).json({ message: "isBusiness must be boolean" });
        }

        const updated = await User.findByIdAndUpdate(
            id,
            { isBusiness },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: "User not found" });

        return res.json(updated);
    } catch (err: any) {
        console.error("toggleBusiness error:", err?.message || err);
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * DELETE /api/users/:id
 * Self or Admin – delete user
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const auth = (req as any).user as AuthUser | undefined;

        if (!isSelfOrAdmin(auth, id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "User not found" });

        return res.status(204).send();
    } catch (err: any) {
        console.error("deleteUser error:", err?.message || err);
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};