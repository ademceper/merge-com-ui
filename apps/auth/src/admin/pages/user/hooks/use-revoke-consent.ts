import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeUserConsent } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useRevokeConsent(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (clientId: string) =>
            revokeUserConsent(userId, clientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.consents(userId) });
        }
    });
}
