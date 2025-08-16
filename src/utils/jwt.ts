import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = (process.env.JWT_SECRET as Secret) || "Vilage_Ozora";

export type JwtPayload = {
    userId: string;
    isBusiness: boolean;
    isAdmin: boolean;
};


export function signToken(payload: JwtPayload, options: SignOptions = {}): string {
    return jwt.sign(payload as object, JWT_SECRET, options);
}
