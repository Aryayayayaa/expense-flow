import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/features/auth/lib/users";
import { authConfig } from "@/auth.config";
import type { CurrencyCode } from "./constants/currencies";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const user = await getUserByEmail(String(credentials.email));

        if (!user || !user.password || !user.isActive) {
          return null;
        }

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.password,
        );

        if (!valid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          defaultCurrency: user.defaultCurrency as CurrencyCode,
        };
      },
    }),
  ],

  //jwt = json web token
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.defaultCurrency = user.defaultCurrency;
      }

      if (trigger === "update" && session?.user?.defaultCurrency) {
        token.defaultCurrency = session.user.defaultCurrency;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "HR" | "EMPLOYEE";
        session.user.defaultCurrency = token.defaultCurrency as CurrencyCode;
      }

      return session;
    },
  },
});
