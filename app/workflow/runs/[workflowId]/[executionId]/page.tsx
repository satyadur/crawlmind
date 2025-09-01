// app/workflow/runs/[workflowId]/[executionId]/page.tsx
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionwithPhases";
import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { Loader2Icon } from "lucide-react";
import React, { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

export default async function ExecutionViewerPage({
  params,
}: {
  params: Promise<{ executionId: string; workflowId: string }>;
}) {
  const { executionId, workflowId } = await params;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar
        title="Workflow run details"
        subTitle={`Run ID: ${executionId}`}
        workflowId={workflowId}
        hideButtons
      />
      <section className="flex h-full overflow-auto">
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center">
              <Loader2Icon className="h-10 w-10 animate-spin stroke-primary" />
            </div>
          }
        >
          <ExecutionViewerWrapper executionId={executionId} />
        </Suspense>
      </section>
    </div>
  );
}

async function ExecutionViewerWrapper({
  executionId,
}: {
  executionId: string;
}) {
  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
  if (!workflowExecution) {
    return <div>Not Found</div>;
  }

  return <ExecutionViewer initialData={workflowExecution} />;
}