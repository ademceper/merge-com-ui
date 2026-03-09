import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationIdentityProviders } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationIdentityProviders(orgId: string) {
    return useQuery({
        queryKey: organizationKeys.identityProviders(orgId),
        queryFn: () =>
            fetchOrganizationIdentityProviders(orgId)
    });
}
