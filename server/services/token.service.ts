import jwt, { SignOptions, JwtPayload as JwtPayloadBase } from 'jsonwebtoken';
import { userInterface } from '../interfaces/user.interface';

export interface JwtPayload extends JwtPayloadBase {
    userId: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
}

export class TokenService {
    static generateAccessToken(user: any, roleName: string): string {
        const payload: JwtPayload = {
            userId: user._id ? user._id.toString() : user.userId,
            email: user.email,
            role: roleName,
            type: 'access'
        };
        const options: SignOptions = {
            expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
        };

        return jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET as string,
            options
        );
    }

    static generateRefreshToken(user: any, roleName: string): string {
        const payload: JwtPayload = {
            userId: user._id ? user._id.toString() : user.userId,
            email: user.email,
            role: roleName,
            type: 'refresh'
        };

        const options: SignOptions = {
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
        };
        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET as string,
            options
        );
    }

    static verifyAccessToken(token: string): JwtPayload {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET is not defined');
        }

        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

        } catch (error) {
            throw new Error(`Access token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static verifyRefreshToken(token: string): JwtPayload {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

        } catch (error) {
            throw new Error(`Access token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}