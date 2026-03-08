import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { hasIdentityProviders } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useHasIdentityProviders() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.hasProviders(),
        queryFn: () => hasIdentityProviders(adminClient)
    });
}
