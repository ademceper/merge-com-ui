import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFlow } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useDeleteFlow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flowId: string) => deleteFlow(flowId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.flows()
            });
        }
    });
}
