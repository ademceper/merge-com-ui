import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { addFlowToFlow } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAddFlowToFlow() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: string;
            alias: string;
            description: string;
            provider: string;
            type: string;
        }) => addFlowToFlow(adminClient, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
