import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInitialAccessToken } from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useDeleteInitialAccessToken() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteInitialAccessToken(realm, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.initialAccessTokens()
            });
        }
    });
}
