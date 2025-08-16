import Joi from "joi";

const nameSchema = Joi.object({
    first: Joi.string().min(2).max(50).required(),
    middle: Joi.string().allow("").max(50),
    last: Joi.string().min(2).max(50).required(),
});

const imageSchema = Joi.object({
    url: Joi.string().uri().allow("").required(),
    alt: Joi.string().allow("").required(),
});

const addressSchema = Joi.object({
    state: Joi.string().allow(""),
    country: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    street: Joi.string().min(2).required(),
    houseNumber: Joi.number().integer().min(1).required(),
    zip: Joi.number().integer().min(0).optional(),
});

export const registerUserSchema = Joi.object({
    name: nameSchema.required(),
    isBusiness: Joi.boolean().required(),
    phone: Joi.string()
        .pattern(/^[0-9\-+() ]{7,20}$/)
        .required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)
        .required(),
    address: addressSchema.required(),
    image: imageSchema.required(),
});
