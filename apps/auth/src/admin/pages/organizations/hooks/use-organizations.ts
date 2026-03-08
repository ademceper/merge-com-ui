import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findOrganizations } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useOrganizations() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.lists(),
        queryFn: () => findOrganizations(adminClient)
    });
}
