"use server";

import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { z } from "zod";
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
  const values = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    defaultCurrency: formData.get("defaultCurrency"),
  };

  /*
   * Check whether the submitted email is already registered before
   * validating the remaining registration fields.
   */
  const emailValue = values.email;

  if (typeof emailValue === "string") {
    const emailResult = z
      .email("Please enter a valid email address.")
      .safeParse(emailValue.trim().toLowerCase());

    if (emailResult.success) {
      const existingUser = await getUserByEmail(emailResult.data);

      if (existingUser) {
        return {
          success: false,
          errors: {
            email: ["Email is already registered."],
          },
          message: "",
          values: {
            name: "",
            email: "",
          },
        };
      }
    }
  }

  // Validate the registration data on the server.
  const result = registerSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "",
      values: {
        name: typeof values.name === "string" ? values.name : "",
        email: typeof values.email === "string" ? values.email : "",
      },
    };
  }

  // Hash password = 10 = 2^10 = 1024 rounds of hashing.
  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  const newUser = await createUser({
    name: result.data.name,
    email: result.data.email,
    password: hashedPassword,
    defaultCurrency: result.data.defaultCurrency,
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
      message: "",
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
