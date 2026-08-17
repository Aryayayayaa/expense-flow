import { prisma } from "@/lib/prisma";

import { CreateUserData } from "../types/auth";

export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data,
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function deactivateUser(userId: number) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: false,
    },
  });
}

export async function activateUser(userId: number) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: true,
    },
  });
}
