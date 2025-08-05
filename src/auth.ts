/**
 * AUTH.TS - NextAuth.js Authentication Configuration
 *
 * CHỨC NĂNG CHÍNH:
 * - Cấu hình NextAuth.js cho toàn bộ ứng dụng
 * - Xác thực người dùng qua email/password (Credentials Provider)
 * - Kết nối với MongoDB để lưu trữ sessions và accounts
 * - Quản lý JWT tokens và session callbacks
 * - Xử lý đăng nhập/đăng xuất users
 *
 * SỬ DỤNG:
 * - Import { auth } từ file này để check authentication trong API routes
 * - Tự động tạo các API endpoints: /api/auth/signin, /api/auth/signout, etc.
 * - Providers: useSession(), signIn(), signOut() trong React components
 *
 * CẤU HÌNH:
 * - MongoDB Adapter để lưu session data
 * - JWT strategy với custom callbacks
 * - Session callbacks để thêm user roles vào session object
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import connectToDB from "@/lib/db";

export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          await connectToDB();
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user || !(user as any).password) {
            return null;
          }

          // Kiểm tra password
          const isValid = await bcrypt.compare(
            credentials.password,
            (user as any).password
          );
          if (!isValid) {
            return null;
          }

          // Kiểm tra user có bị ban không (double check)
          if ((user as any).isActive === false) {
            return null;
          }

          return {
            id: (user as any)._id.toString(),
            email: (user as any).email,
            name: (user as any).name,
            roles: (user as any).roles || "user",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
