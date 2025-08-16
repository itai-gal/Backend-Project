import Joi from "joi";

/**
 * PUT /api/users/:id
 * עדכון מלא של פרטי משתמש (ללא: email, password, isAdmin, isBusiness)
 * אם תרצה לאפשר עדכון חלקי, אפשר להחליף ל- .min(1) ובמקום required להשתמש ב-optional()
 */
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

export const updateUserSchema = Joi.object({
    // שדות שמותר לעדכן
    name: nameSchema.required(),
    phone: Joi.string().pattern(/^[0-9\-+() ]{7,20}$/).required(),
    image: imageSchema.required(),
    address: addressSchema.required(),

    // שדות שאסור לעדכן ב- PUT
    email: Joi.forbidden(),
    password: Joi.forbidden(),
    isAdmin: Joi.forbidden(),
    isBusiness: Joi.forbidden(),
})
    .required()
    .messages({
        "any.unknown": "Field '{#label}' is not allowed",
    });

/**
 * PATCH /api/users/:id
 * שינוי סטטוס עסקי בלבד
 */
export const toggleBusinessSchema = Joi.object({
    isBusiness: Joi.boolean().required(),
}).required();
