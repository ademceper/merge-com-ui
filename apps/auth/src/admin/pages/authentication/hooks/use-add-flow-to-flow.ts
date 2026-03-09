import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFlowToFlow } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useAddFlowToFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: {
            flow: string;
            alias: string;
            description: string;
            provider: string;
            type: string;
        }) => addFlowToFlow(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
