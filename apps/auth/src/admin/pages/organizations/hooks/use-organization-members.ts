import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationMembers } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationMembers(
    orgId: string,
    filters?: { search?: string; membershipType?: string }
) {
    return useQuery({
        queryKey: organizationKeys.members(orgId, filters),
        queryFn: () => fetchOrganizationMembers(orgId, filters)
    });
}
