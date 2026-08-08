"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { signIn } from "@/auth";

import { createUser, getUserByEmail } from "../lib/users";
import { registerSchema } from "../schemas/register-schema";
import { loginSchema } from "../schemas/login-schema";
import { AuthState } from "../types/auth";

export async function registerUserAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Convert FormData to a normal object
  const values = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validating the input
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "",
    };
  }

  // Check if email already exists
  const existingUser = await getUserByEmail(result.data.email);

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: ["Email is already registered."],
      },
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  // Save user
  await createUser({
    ...result.data,
    password: hashedPassword,
  });

  redirect("/login");

  return {
    success: true,
    errors: {},
    message: "",
  };
}

export async function loginUserAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const user = await getUserByEmail(result.data.email);

  if (!user) {
    return {
      success: false,
      errors: {
        email: ["No account found with this email."],
      },
    };
  }

  if (!user.password) {
    return {
      success: false,
      errors: {},
      message: "Invalid email or password.",
    };
  }

  const passwordMatches = await bcrypt.compare(
    result.data.password,
    user.password,
  );

  if (!passwordMatches) {
    return {
      success: false,
      errors: {
        password: ["Incorrect password."],
      },
    };
  }

  await signIn("credentials", {
    email: result.data.email,
    password: result.data.password,
    redirectTo: "/expenses",
  });
  return {
    success: true,
    errors: {},
    message: "",
  };
}
