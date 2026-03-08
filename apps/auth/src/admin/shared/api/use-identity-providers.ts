import { useQuery } from "@tanstack/react-query";
import { searchIdentityProviders } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useIdentityProviders(
    search: string,
    identityProviderType: string,
    realmOnly: boolean
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.identityProviders.search(
            search,
            identityProviderType,
            realmOnly
        ),
        queryFn: () =>
            searchIdentityProviders(adminClient, search, identityProviderType, realmOnly)
    });
}
