import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regenerateClientSecret } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useRegenerateClientSecret() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientId: string) => regenerateClientSecret(clientId),
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
