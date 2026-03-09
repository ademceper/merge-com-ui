import { useQuery } from "@tanstack/react-query";
import { findGroup } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Fetch a single group by id.
 */
export function useGroup(id: string) {
    return useQuery({
        queryKey: groupKeys.detail(id),
        queryFn: () => findGroup(id),
        enabled: !!id
    });
}
