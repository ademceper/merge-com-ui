import { useQuery } from "@tanstack/react-query";
import { findGroups, findSubGroups } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Fetch top-level groups or sub-groups of a parent.
 */
export function useGroupsList(parentId?: string) {
    return useQuery({
        queryKey: parentId ? groupKeys.subGroups(parentId) : groupKeys.lists(),
        queryFn: () =>
            parentId
                ? findSubGroups(parentId)
                : findGroups()
    });
}
