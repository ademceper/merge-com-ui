import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { createWorkflow } from "@/admin/api/workflows";
import { workflowKeys } from "./keys";

export function useCreateWorkflow() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (yamlContent: string) =>
            createWorkflow(realm, yamlContent),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workflowKeys.lists()
            });
        }
    });
}
