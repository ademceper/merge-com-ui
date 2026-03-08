import type WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateWorkflow } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useUpdateWorkflow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            workflow
        }: {
            id: string;
            workflow: WorkflowRepresentation;
        }) => updateWorkflow(adminClient, id, workflow),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workflowKeys.all
            });
        }
    });
}
