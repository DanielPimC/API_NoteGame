import * as jwt from 'jsonwebtoken';

export type AuthenticationData = { id: string; role: string };

export class Authenticator {

    generateToken = (payload: AuthenticationData): string => {
        return jwt.sign(
            payload,
            String(process.env.JWT_KEY),
            { expiresIn: '1d' }
        );
    };

    getTokenData = (token: string): AuthenticationData => {
        try {
            const { id, role } = jwt.verify(token, String(process.env.JWT_KEY)) as AuthenticationData;
            return { id, role };
        } catch (error: any) {
            if (error.message.includes("jwt expired")) {
                throw new Error("Token expirado");
            }
            throw new Error(error.message);
        }
    };
}