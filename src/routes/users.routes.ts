import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// Controllers
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    toggleBusiness,
    deleteUser,
} from "../controllers/users.controller";

// Middlewares
import { validate } from "../middleware/validate";
import auth from "../middleware/auth"; // ← יש default export בקובץ auth.ts

// Joi Schemas
import { registerUserSchema } from "../validation/users.schema";
import { loginSchema } from "../validation/auth.schema";
import { updateUserSchema, toggleBusinessSchema } from "../validation/users.update.schema";

/** Middleware: בדיקת תקינות ObjectId לפרמטר :id */
function validateObjectIdParam(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }
    next();
}

const router = Router();

/** Register (public) */
router.post("/", validate(registerUserSchema), registerUser);

/** Login (public) */
router.post("/login", validate(loginSchema), loginUser);

/** Get all users (protected; הרשאת Admin נבדקת בקונטרולר) */
router.get("/", auth, getAllUsers);

/** Get user by id (protected; self/admin בקונטרולר) */
router.get("/:id", auth, validateObjectIdParam, getUserById);

/** Update user (protected; self/admin בקונטרולר) */
router.put(
    "/:id",
    auth,
    validateObjectIdParam,
    validate(updateUserSchema),
    updateUser
);

/** Toggle isBusiness (protected; self/admin בקונטרולר) */
router.patch(
    "/:id",
    auth,
    validateObjectIdParam,
    validate(toggleBusinessSchema),
    toggleBusiness
);

/** Delete user (protected; self/admin בקונטרולר) */
router.delete("/:id", auth, validateObjectIdParam, deleteUser);

/** ייצוא ברירת מחדל — חשוב לשמירה על הייבוא ב-app.ts */
export default router;
