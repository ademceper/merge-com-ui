import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regenerateClientSecret } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useRegenerateClientSecret() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientId: string) => regenerateClientSecret(adminClient, clientId),
        onSuccess: (_data, clientId) => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.credentials(clientId)
            });
            queryClient.invalidateQueries({
                queryKey: clientKeys.detail(clientId)
            });
        }
    });
}
