import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlinkFederatedIdentity } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUnlinkFederatedIdentity(userId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (federatedIdentityId: string) =>
            unlinkFederatedIdentity(adminClient, userId, federatedIdentityId),
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
