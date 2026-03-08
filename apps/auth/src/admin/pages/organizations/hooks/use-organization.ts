import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findOrganization } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganization(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: () => findOrganization(adminClient, id)
    });
}
