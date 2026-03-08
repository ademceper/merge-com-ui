import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchOrganizationMembers } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationMembers(
    orgId: string,
    filters?: { search?: string; membershipType?: string }
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.members(orgId, filters),
        queryFn: () => fetchOrganizationMembers(adminClient, orgId, filters)
    });
}
