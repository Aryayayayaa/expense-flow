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
