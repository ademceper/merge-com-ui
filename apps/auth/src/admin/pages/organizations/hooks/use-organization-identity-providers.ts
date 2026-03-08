import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchOrganizationIdentityProviders } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationIdentityProviders(orgId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.identityProviders(orgId),
        queryFn: () =>
            fetchOrganizationIdentityProviders(adminClient, orgId)
    });
}
