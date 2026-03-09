import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkflow } from "@/admin/api/workflows";
import { workflowKeys } from "./keys";

export function useDeleteWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workflowKeys.lists()
            });
        }
    });
}
