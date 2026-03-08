import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { copyFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useDuplicateFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: string;
            newName: string;
            description?: string;
            originalDescription?: string;
        }) => copyFlow(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
