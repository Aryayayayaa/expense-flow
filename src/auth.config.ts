import type { NextAuthConfig } from "next-auth";

const protectedRoutes = [
  "/dashboard",
  "/expenses",
  "/expenses/new",
  "/profile",
  "/analytics",
  "/reports",
  "/approvals",
  "/admin",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      // Server Actions such as logout should be allowed to execute.
      if (request.method !== "GET") {
        return true;
      }

      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );

      // Public route
      if (!isProtectedRoute) {
        return true;
      }

      // Protected route + authenticated user
      if (isLoggedIn) {
        return true;
      }

      // Protected route + unauthenticated user
      return false;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
