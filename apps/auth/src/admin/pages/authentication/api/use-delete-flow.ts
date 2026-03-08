import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useDeleteFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flowId: string) => deleteFlow(adminClient, flowId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
