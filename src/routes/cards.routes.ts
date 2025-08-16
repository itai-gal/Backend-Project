import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCardSchema, updateCardSchema } from "../validation/cards.schema";
import {
    getAllCards,
    getCardById,
    getMyCards,
    createCard,
    updateCard,
    deleteCard,
    toggleLike,
} from "../controllers/cards.controller";

function validateObjectIdParam(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid card id" });
    }
    next();
}

const router = Router();

router.get("/", getAllCards);
router.get("/my-cards", auth, getMyCards);
router.get("/:id", validateObjectIdParam, getCardById);

router.post("/", auth, validate(createCardSchema), createCard);
router.put("/:id", auth, validateObjectIdParam, validate(updateCardSchema), updateCard);
router.delete("/:id", auth, validateObjectIdParam, deleteCard);

router.patch("/:id", auth, validateObjectIdParam, toggleLike); // like/unlike

export default router;