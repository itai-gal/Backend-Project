import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
    name: { first: string; middle?: string; last: string };
    phone: string;
    email: string;
    password: string; // נשמר ב-DB אבל לא מוחזר כברירת מחדל
    image: { url: string; alt: string };
    address: {
        state?: string;
        country: string;
        city: string;
        street: string;
        houseNumber: number;
        zip?: number;
    };
    isBusiness: boolean;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            first: { type: String, required: true, trim: true },
            middle: { type: String, default: "" },
            last: { type: String, required: true, trim: true },
        },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false }, // לא נשלף כברירת מחדל
        image: {
            url: { type: String, required: true, default: "" },
            alt: { type: String, required: true, default: "" },
        },
        address: {
            state: { type: String, default: "not defined" },
            country: { type: String, required: true },
            city: { type: String, required: true },
            street: { type: String, required: true },
            houseNumber: { type: Number, required: true },
            zip: { type: Number, default: 0 },
        },
        isBusiness: { type: Boolean, required: true, default: false },
        isAdmin: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

// להסיר סיסמה אם משום מה נשלפה ידנית
userSchema.set("toJSON", {
    transform: (_doc, ret: any) => {
        delete ret.password;
        return ret;
    },
});

export const User = model<IUser>("User", userSchema);
