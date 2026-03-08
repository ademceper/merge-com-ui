import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateClientSecret } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useInvalidateClientSecret() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientId: string) => invalidateClientSecret(clientId),
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
