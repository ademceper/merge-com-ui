import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchGroupChildren, fetchGroupTree } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Fetch groups for the tree sidebar via the admin-ui endpoint.
 */
export function useGroupTree(params: {
    first: number;
    max: number;
    search: string;
    activeItemId?: string;
    firstSub: number;
    subGroupCount: number;
}) {
    const { adminClient } = useAdminClient();
    const { first, max, search, activeItemId, firstSub, subGroupCount } = params;
    return useQuery({
        queryKey: groupKeys.tree({
            first,
            max,
            search,
            activeItemId,
            firstSub
        }),
        queryFn: async () => {
            const groups = await fetchGroupTree(adminClient, {
                first,
                max,
                search
            });
            let subGroups: GroupRepresentation[] = [];
            if (activeItemId) {
                subGroups = await fetchGroupChildren(
                    adminClient,
                    activeItemId,
                    firstSub,
                    subGroupCount
                );
            }
            return { groups, subGroups };
        }
    });
}
