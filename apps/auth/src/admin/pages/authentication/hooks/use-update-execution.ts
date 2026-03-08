import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateExecution } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useUpdateExecution() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flowAlias: string;
            execution: Record<string, unknown>;
        }) => updateExecution(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
