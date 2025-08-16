import { Request, Response } from "express";
import mongoose from "mongoose";
import { Card } from "../models/card.model";

type AuthUser = { userId: string; isBusiness: boolean; isAdmin: boolean };

function isOwnerOrAdmin(auth: AuthUser | undefined, ownerId: string) {
    return Boolean(auth?.isAdmin) || auth?.userId === ownerId;
}

/** GET /api/cards  — ציבורי */
export const getAllCards = async (_req: Request, res: Response) => {
    const cards = await Card.find().sort({ createdAt: -1 });
    return res.json(cards);
};

/** GET /api/cards/:id — ציבורי */
export const getCardById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const card = await Card.findById(id);
        if (!card) return res.status(404).json({ message: "Card not found" });
        return res.json(card);
    } catch (err: any) {
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid card id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/** GET /api/cards/my-cards — מחייב התחברות: כל הכרטיסים שלי */
export const getMyCards = async (req: Request, res: Response) => {
    const auth = (req as any).user as AuthUser | undefined;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });

    const cards = await Card.find({ user_id: new mongoose.Types.ObjectId(auth.userId) })
        .sort({ createdAt: -1 });
    return res.json(cards);
};

/** POST /api/cards — רק משתמש עם isBusiness=true */
export const createCard = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).user as AuthUser | undefined;
        if (!auth) return res.status(401).json({ message: "Unauthorized" });
        if (!auth.isBusiness && !auth.isAdmin) {
            return res.status(403).json({ message: "Business account required" });
        }

        const payload = req.body;
        const card = await Card.create({
            ...payload,
            user_id: new mongoose.Types.ObjectId(auth.userId),
        });

        return res.status(201).json(card);
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Duplicate bizNumber" });
        }
        if (err?.name === "ValidationError") {
            const details = Object.values(err.errors || {}).map((e: any) => e?.message);
            return res.status(400).json({ message: "Validation error", details });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/** PUT /api/cards/:id — בעל הכרטיס או אדמין */
export const updateCard = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).user as AuthUser | undefined;
        if (!auth) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params as { id: string };
        const card = await Card.findById(id);
        if (!card) return res.status(404).json({ message: "Card not found" });

        if (!isOwnerOrAdmin(auth, card.user_id.toString())) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updated = await Card.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        return res.json(updated);
    } catch (err: any) {
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid card id" });
        }
        if (err?.name === "ValidationError") {
            const details = Object.values(err.errors || {}).map((e: any) => e?.message);
            return res.status(400).json({ message: "Validation error", details });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/** DELETE /api/cards/:id — בעל הכרטיס או אדמין */
export const deleteCard = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).user as AuthUser | undefined;
        if (!auth) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params as { id: string };
        const card = await Card.findById(id);
        if (!card) return res.status(404).json({ message: "Card not found" });

        if (!isOwnerOrAdmin(auth, card.user_id.toString())) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await Card.findByIdAndDelete(id);
        return res.status(204).send();
    } catch (err: any) {
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid card id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

/** PATCH /api/cards/:id — לייק/אנלייק (כל משתמש מחובר) */
export const toggleLike = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).user as AuthUser | undefined;
        if (!auth) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params as { id: string };
        const userObjectId = new mongoose.Types.ObjectId(auth.userId);

        const card = await Card.findById(id);
        if (!card) return res.status(404).json({ message: "Card not found" });

        const hasLiked = card.likes.some((u) => u.toString() === auth.userId);

        if (hasLiked) {
            card.likes = card.likes.filter((u) => u.toString() !== auth.userId);
        } else {
            card.likes.push(userObjectId);
        }

        await card.save();
        return res.json({ liked: !hasLiked, likesCount: card.likes.length, card });
    } catch (err: any) {
        if (err?.name === "CastError") {
            return res.status(400).json({ message: "Invalid card id" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
