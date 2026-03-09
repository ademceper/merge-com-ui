import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientsInitialAccess } from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useCreateInitialAccessToken() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (token: Record<string, unknown>) =>
            createClientsInitialAccess(realm, token),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.initialAccessTokens()
            });
        }
    });
}
