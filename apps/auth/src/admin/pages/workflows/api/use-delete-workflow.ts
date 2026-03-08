import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteWorkflow } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useDeleteWorkflow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteWorkflow(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workflowKeys.lists()
            });
        }
    });
}
