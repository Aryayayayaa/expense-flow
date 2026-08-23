"use server";

import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { signIn } from "@/auth";

import { createUser, getUserByEmail } from "../lib/users";
import { registerSchema } from "../schemas/register-schema";
import { loginSchema } from "../schemas/login-schema";
import { AuthState } from "../types/auth";

import { createNotification } from "@/features/notifications/lib/notifications";

export async function registerUserAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Convert FormData to a normal object.
  const values = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    defaultCurrency: formData.get("defaultCurrency"),
  };

  // Validate the registration data on the server.
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "",
    };
  }

  // Check if email already exists.
  const existingUser = await getUserByEmail(result.data.email);

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: ["Email is already registered."],
      },
    };
  }

  // Hash password.
  // 10 = 2^10 = 1024 rounds of hashing.
  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  // Save user including their selected default currency.
  const newUser = await createUser({
    ...result.data,
    password: hashedPassword,
  });

  // Notify HR and Admin.
  const reviewers = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "HR"],
      },
    },
    select: {
      id: true,
    },
  });

  await Promise.all(
    reviewers.map((reviewer) =>
      createNotification({
        userId: reviewer.id,
        type: "EMPLOYEE_ACCOUNT_CREATED",
        title: "New Employee Account",
        message: `A new employee account has been created for ${newUser.name}.`,
        metadata: {
          employeeId: newUser.id,
          employeeName: newUser.name,
          employeeEmail: newUser.email,
          defaultCurrency: newUser.defaultCurrency,
        },
      }),
    ),
  );

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

  if (!user.isActive) {
    return {
      success: false,
      errors: {
        email: [
          "Your account has been deactivated. Please contact HR or an administrator.",
        ],
      },
      message: "",
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
    redirectTo: "/dashboard",
  });

  return {
    success: true,
    errors: {},
    message: "",
  };
}
