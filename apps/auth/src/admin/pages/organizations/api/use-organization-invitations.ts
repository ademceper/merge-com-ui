import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchOrganizationInvitations } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizationInvitations(
    orgId: string,
    filters?: { search?: string; status?: string }
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.invitations(orgId, filters),
        queryFn: () =>
            fetchOrganizationInvitations(adminClient, orgId, filters)
    });
}
