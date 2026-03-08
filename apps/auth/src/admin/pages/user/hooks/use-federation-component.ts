import { useQuery } from "@tanstack/react-query";
import { fetchFederationComponent, fetchStorageProviderName } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useFederationComponent(
    federationLink: string,
    hasViewRealmAccess: boolean
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.federationComponent(federationLink),
        queryFn: () =>
            hasViewRealmAccess
                ? fetchFederationComponent(adminClient, federationLink)
                : fetchStorageProviderName(adminClient, federationLink),
        enabled: !!federationLink
    });
}
