/**
 * NEXT-AUTH.D.TS - TypeScript Module Augmentation cho NextAuth.js
 * 
 * CHỨC NĂNG CHÍNH:
 * - Mở rộng NextAuth.js default types để thêm custom fields
 * - Thêm 'roles' field vào Session và User objects
 * - Thêm 'id' field vào Session.user
 * - Type safety cho session.user.roles trong toàn bộ app
 * 
 * MODULE AUGMENTATION:
 * - Extend NextAuth Session interface
 * - Extend NextAuth User interface  
 * - Extend NextAuth JWT interface
 * 
 * IMPACT:
 * - session.user.roles có type "user" | "admin"
 * - session.user.id available với proper typing
 * - TypeScript sẽ enforce correct usage
 * 
 * USAGE: Tự động áp dụng khi import NextAuth types
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            roles: "user" | "admin";
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        roles: "user" | "admin";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        roles: "user" | "admin";
    }
}

models / User.ts;
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    image?: string;
    nickname?: string;
    gender?: string;
    country?: string;
    birthDate?: Date;
    roles?: string;
    isActive?: boolean;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: false,
        },
        image: {
            type: String,
        },
        roles: {
            type: String,
            default: 'user',
        },
        nickname: {
            type: String,
        },
        gender: {
            type: String,
        },
        country: {
            type: String,
        },
        birthDate: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
