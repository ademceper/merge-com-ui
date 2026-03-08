import { useQuery } from "@tanstack/react-query";
import { findGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Fetch a single group by id.
 */
export function useGroup(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: groupKeys.detail(id),
        queryFn: () => findGroup(adminClient, id),
        enabled: !!id
    });
}
