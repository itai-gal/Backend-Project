import Joi from "joi";

const imageSchema = Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().min(1).required(),
});

const addressSchema = Joi.object({
    state: Joi.string().allow(""),
    country: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    street: Joi.string().min(2).required(),
    houseNumber: Joi.number().integer().min(1).required(),
    zip: Joi.number().integer().min(0).optional(),
});

export const createCardSchema = Joi.object({
    title: Joi.string().min(2).max(256).required(),
    subtitle: Joi.string().min(2).max(256).required(),
    description: Joi.string().min(2).max(1024).required(),
    phone: Joi.string().pattern(/^[0-9\-+() ]{7,20}$/).required(),
    email: Joi.string().email().required(),
    web: Joi.string().uri().allow(""),
    image: imageSchema.required(),
    address: addressSchema.required(),
    // אופציונלי: אפשר לשלוח bizNumber, אם לא – יווצר אוטומטית
    bizNumber: Joi.number().integer().min(1).optional(),
}).required();

export const updateCardSchema = Joi.object({
    title: Joi.string().min(2).max(256),
    subtitle: Joi.string().min(2).max(256),
    description: Joi.string().min(2).max(1024),
    phone: Joi.string().pattern(/^[0-9\-+() ]{7,20}$/),
    email: Joi.string().email(),
    web: Joi.string().uri().allow(""),
    image: imageSchema,
    address: addressSchema,
}).min(1); // חייב לפחות שדה אחד
