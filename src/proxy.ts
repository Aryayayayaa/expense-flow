import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // Allow Server Actions / non-GET requests to continue.
  if (request.method !== "GET") {
    return;
  }

  // Redirect unauthenticated users to login.
  if (!request.auth?.user) {
    return Response.redirect(new URL("/login", request.url));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/expenses/new",
    "/profile/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/approvals/:path*",
    "/admin/:path*",
    "/hr/:path*",
    "/role-verification/:path*",
  ],
};
