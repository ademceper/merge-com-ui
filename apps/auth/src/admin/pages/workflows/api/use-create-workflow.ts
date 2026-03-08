import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { createWorkflow } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useCreateWorkflow() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (yamlContent: string) =>
            createWorkflow(adminClient, realm, yamlContent),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workflowKeys.lists()
            });
        }
    });
}
