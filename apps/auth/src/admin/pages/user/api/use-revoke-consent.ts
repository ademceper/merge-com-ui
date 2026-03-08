import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeUserConsent } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useRevokeConsent(userId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientId: string) =>
            revokeUserConsent(adminClient, userId, clientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.consents(userId) });
        }
    });
}
