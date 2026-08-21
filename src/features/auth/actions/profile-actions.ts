"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notifications/lib/notifications";

import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currencies";

async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: Number(session.user.id),
    role: session.user.role,
  };
}

export async function updateOwnProfileAction(data: {
  name?: string;
  email?: string;
  password?: string;
  image?: string | null;
  defaultCurrency?: string;
}) {
  try {
    const currentUser = await requireUser();

    if (!currentUser) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultCurrency: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      image?: string | null;
      defaultCurrency?: string;
    } = {};

    const changes: string[] = [];

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        return {
          success: false,
          message: "Name cannot be empty.",
        };
      }

      if (name !== user.name) {
        if (currentUser.role !== "ADMIN" && currentUser.role !== "HR") {
          return {
            success: false,
            message: "Employees must submit a name change request to HR.",
          };
        }

        updateData.name = name;
        changes.push("name");
      }
    }

    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();

      if (!email) {
        return {
          success: false,
          message: "Email cannot be empty.",
        };
      }

      if (email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        });

        if (existingUser && existingUser.id !== user.id) {
          return {
            success: false,
            message: "Email is already registered.",
          };
        }

        updateData.email = email;
        changes.push("email");
      }
    }

    if (data.password !== undefined) {
      if (data.password.length < 8) {
        return {
          success: false,
          message: "Password must be at least 8 characters.",
        };
      }

      updateData.password = await bcrypt.hash(data.password, 10);
      changes.push("password");
    }

    if (data.image !== undefined && data.image !== user.image) {
      updateData.image = data.image;
      changes.push("profile photo");
    }

    if (data.defaultCurrency !== undefined) {
      const defaultCurrency = data.defaultCurrency.trim().toUpperCase();

      const isSupportedCurrency = SUPPORTED_CURRENCIES.some(
        (currency) => currency.code === defaultCurrency,
      );

      if (!isSupportedCurrency) {
        return {
          success: false,
          message: "Please select a supported default currency.",
        };
      }

      if (defaultCurrency !== user.defaultCurrency) {
        updateData.defaultCurrency = defaultCurrency;
        changes.push("default currency");
      }
    }

    if (changes.length === 0) {
      return {
        success: true,
        message: "No changes were made.",
      };
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        defaultCurrency: true,
      },
    });

    await createNotification({
      userId: updatedUser.id,
      type: "EMPLOYEE_ACCOUNT_UPDATED",
      title: "Profile Updated",
      message: `Your profile was updated: ${changes.join(", ")}.`,
      metadata: {
        changes,
        performedById: updatedUser.id,
        performedByRole: currentUser.role,
        defaultCurrency: updatedUser.defaultCurrency ?? DEFAULT_CURRENCY,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/analytics");
    revalidatePath("/approvals");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Update Own Profile Error:", error);

    return {
      success: false,
      message: "Unable to update profile.",
    };
  }
}
