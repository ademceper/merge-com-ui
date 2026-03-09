import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlinkFederatedIdentity } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useUnlinkFederatedIdentity(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (federatedIdentityId: string) =>
            unlinkFederatedIdentity(userId, federatedIdentityId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: userKeys.federatedIdentities(userId)
            });
            queryClient.invalidateQueries({
                queryKey: userKeys.linkedIdPs(userId)
            });
        }
    });
}
