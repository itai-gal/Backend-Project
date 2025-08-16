import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate =
    (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details.map(d => ({ message: d.message, path: d.path })),
            });
        }
        req.body = value;
        next();
    };
