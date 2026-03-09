import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationInvitations } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationInvitations(
    orgId: string,
    filters?: { search?: string; status?: string }
) {
    return useQuery({
        queryKey: organizationKeys.invitations(orgId, filters),
        queryFn: () =>
            fetchOrganizationInvitations(orgId, filters)
    });
}
