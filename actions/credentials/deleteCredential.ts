"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DeleteCredential(name: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  return await prisma.credential.delete({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });
}
