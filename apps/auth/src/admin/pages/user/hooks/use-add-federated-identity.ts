import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToFederatedIdentity } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useAddFederatedIdentity(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            federatedIdentityId,
            federatedIdentity
        }: {
            federatedIdentityId: string;
            federatedIdentity: FederatedIdentityRepresentation;
        }) => addToFederatedIdentity(userId, federatedIdentityId, federatedIdentity),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: userKeys.federatedIdentities(userId)
            });
            queryClient.invalidateQueries({
                queryKey: userKeys.linkedIdPs(userId)
            });
            queryClient.invalidateQueries({
                queryKey: userKeys.availableIdPs()
            });
        }
    });
}
