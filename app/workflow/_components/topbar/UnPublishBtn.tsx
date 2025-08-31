"use client";

import { UnPublishWorkflow } from "@/actions/workflows/unPublishWorkflow";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

function UnPublishBtn({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: UnPublishWorkflow,
    onSuccess: (data) => {
      toast.success("Workflow UnPublished", { id: workflowId });
      router.push(`/workflow/editor/${data.id}`);
    },
    onError: () => {
      toast.error("Something went wrong", { id: workflowId });
    },
  });

  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2 cursor-pointer"
      disabled={mutation.isPending}
      onClick={() => {
        toast.loading("UnPublishing workflow...", { id: workflowId });
        mutation.mutate(workflowId);
      }}
    >
      <DownloadIcon size={16} className="stroke-orange-500" />
      UnPublish
    </Button>
  );
}

export default UnPublishBtn;
