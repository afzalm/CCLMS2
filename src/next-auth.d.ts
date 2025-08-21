import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
};

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}