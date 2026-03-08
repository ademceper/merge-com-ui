import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchFederatedIdentities, fetchLinkedIdPs } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

type WithProviderId = FederatedIdentityRepresentation & {
    providerId: string;
};

export function useLinkedIdPs(userId: string, canQueryIDPDetails: boolean) {
    const { adminClient } = useAdminClient();
    return useQuery<WithProviderId[]>({
        queryKey: userKeys.linkedIdPs(userId),
        queryFn: async () => {
            const allFedIds = (await fetchFederatedIdentities(
                adminClient,
                userId
            )) as WithProviderId[];

            if (canQueryIDPDetails) {
                const allProviders = await fetchLinkedIdPs(adminClient, userId);
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
