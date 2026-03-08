import { useQuery } from "@tanstack/react-query";
import { searchIdentityProviders } from "../../api/shared";
import { sharedKeys } from "./keys";

export function useIdentityProviders(
    search: string,
    identityProviderType: string,
    realmOnly: boolean
) {
    return useQuery({
        queryKey: sharedKeys.identityProviders.search(
            search,
            identityProviderType,
            realmOnly
        ),
        queryFn: () =>
            searchIdentityProviders(search, identityProviderType, realmOnly)
    });
}
