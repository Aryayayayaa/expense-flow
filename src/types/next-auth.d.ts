import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "ADMIN" | "HR" | "EMPLOYEE";
    };
  }

  interface User {
    role: "ADMIN" | "HR" | "EMPLOYEE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "HR" | "EMPLOYEE";
  }
}
