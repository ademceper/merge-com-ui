import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePolicy } from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function useDeletePolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, policyId }: { clientId: string; policyId: string }) =>
            deletePolicy(clientId, policyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
