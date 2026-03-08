import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInitialAccessToken } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useDeleteInitialAccessToken() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteInitialAccessToken(adminClient, realm, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.initialAccessTokens()
            });
        }
    });
}
