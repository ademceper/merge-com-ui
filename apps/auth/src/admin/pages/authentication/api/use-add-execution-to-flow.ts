import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { addExecutionToFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAddExecutionToFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: { flow: string; provider: string }) =>
            addExecutionToFlow(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
