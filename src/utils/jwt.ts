import jwt, { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const JWT_SECRET: Secret = (process.env.JWT_SECRET as Secret) || "dev_secret_change_me";

export type JwtPayload = {
    userId: string;
    isBusiness: boolean;
    isAdmin: boolean;
};


export function signToken(payload: JwtPayload, options: SignOptions = {}): string {
    return jwt.sign(payload as object, JWT_SECRET, options);
}
