import { useQuery } from "@tanstack/react-query";
import { findGroups, findSubGroups } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Fetch top-level groups or sub-groups of a parent.
 */
export function useGroupsList(parentId?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: parentId ? groupKeys.subGroups(parentId) : groupKeys.lists(),
        queryFn: () =>
            parentId
                ? findSubGroups(adminClient, parentId)
                : findGroups(adminClient)
    });
}
