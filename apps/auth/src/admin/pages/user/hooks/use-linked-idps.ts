import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchFederatedIdentities, fetchLinkedIdPs } from "@/admin/api/users";
import { userKeys } from "./keys";

type WithProviderId = FederatedIdentityRepresentation & {
    providerId: string;
};

export function useLinkedIdPs(userId: string, canQueryIDPDetails: boolean) {
    return useQuery<WithProviderId[]>({
        queryKey: userKeys.linkedIdPs(userId),
        queryFn: async () => {
            const allFedIds = (await fetchFederatedIdentities(
                userId
            )) as WithProviderId[];

            if (canQueryIDPDetails) {
                const allProviders = await fetchLinkedIdPs(userId);
                for (const element of allFedIds) {
                    element.providerId = allProviders.find(
                        item => item.alias === element.identityProvider
                    )?.providerId!;
                }
            }

            return allFedIds;
        },
        enabled: !!userId
    });
}
