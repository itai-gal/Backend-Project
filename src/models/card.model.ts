import mongoose, { Schema, Types, HydratedDocument } from "mongoose";

export interface ICard {
    title: string;
    subtitle: string;
    description: string;
    phone: string;
    email: string;
    web?: string;
    image: {
        url: string;
        alt: string;
    };
    address: {
        state?: string;
        country: string;
        city: string;
        street: string;
        houseNumber: number;
        zip?: number;
    };
    bizNumber: number;                 // unique business number
    user_id: Types.ObjectId;           // owner
    likes: Types.ObjectId[];           // users who liked
    createdAt?: Date;
    updatedAt?: Date;
}

type CardDoc = HydratedDocument<ICard>;

const CardSchema = new Schema<ICard>(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        web: { type: String, default: "" },
        image: {
            url: { type: String, required: true },
            alt: { type: String, required: true },
        },
        address: {
            state: { type: String, default: "" },
            country: { type: String, required: true },
            city: { type: String, required: true },
            street: { type: String, required: true },
            houseNumber: { type: Number, required: true },
            zip: { type: Number, default: 0 },
        },
        bizNumber: { type: Number, required: true, unique: true },
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    },
    { timestamps: true }
);

// ייצור מספר עסק ייחודי
CardSchema.pre("validate", async function (next) {
    const doc = this as CardDoc;

    if (doc.isNew && !doc.bizNumber) {
        let candidate: number;
        let exists = true;

        do {
            candidate = Math.floor(1000000 + Math.random() * 9000000); // 7 ספרות
            exists = !!(await Card.exists({ bizNumber: candidate }));
        } while (exists);

        doc.bizNumber = candidate;
    }
    next();
});

export const Card = mongoose.model<ICard>("Card", CardSchema);
