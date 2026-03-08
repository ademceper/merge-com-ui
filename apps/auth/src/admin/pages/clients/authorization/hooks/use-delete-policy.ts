import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePolicy } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useDeletePolicy() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, policyId }: { clientId: string; policyId: string }) =>
            deletePolicy(adminClient, clientId, policyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
