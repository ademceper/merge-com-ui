import { useQuery } from "@tanstack/react-query";
import { fetchFederationComponent, fetchStorageProviderName } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useFederationComponent(
    federationLink: string,
    hasViewRealmAccess: boolean
) {
    return useQuery({
        queryKey: userKeys.federationComponent(federationLink),
        queryFn: () =>
            hasViewRealmAccess
                ? fetchFederationComponent(federationLink)
                : fetchStorageProviderName(federationLink),
        enabled: !!federationLink
    });
}
