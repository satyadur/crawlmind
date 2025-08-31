/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CronExpressionParser } from "cron-parser";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflowCron({
  id,
  cron,
}: {
  id: string;
  cron: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }
  try {
    const interval = CronExpressionParser.parse(cron, {
      currentDate: new Date(),
    });
    return await prisma.workFlow.update({
      where: { id, userId },
      data: {
        cron,
        nextRunAt: interval.next().toDate(),
      },
    });
  } catch (err: any) {
    console.error("invalid crop", err.message);
    throw new Error("invalid cron expression");
  }

  revalidatePath("/workflows");
}
