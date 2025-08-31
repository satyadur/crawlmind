"use server";

import prisma from "@/lib/prisma";
import {
  duplicateWorkflowSchema,
  duplicateWorkflowSchemaType,
} from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";

export async function DuplicateWorkflow(form: duplicateWorkflowSchemaType) {
  const { success, data } = duplicateWorkflowSchema.safeParse(form);
  if (!success) {
    throw new Error("invalid form data");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthorized");
  }

  const sourceWorkflow = await prisma.workFlow.findUnique({
    where: { id: data.workflowId, userId },
  });

  if (!sourceWorkflow) {
    throw new Error("workflow not found");
  }

  const result = await prisma.workFlow.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      status: WorkflowStatus.DRAFT,
      definition: sourceWorkflow.definition,
    },
  });

  if (!result) {
    throw new Error("failed to duplicate workflow");
  }

  return { result };
}
