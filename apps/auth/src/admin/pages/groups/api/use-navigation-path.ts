import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Resolve navigation path: given an array of group ids from the URL,
 * fetch each group to rebuild breadcrumb state.
 */
export function useNavigationPath(ids: string[] | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: groupKeys.navigationPath(ids ?? []),
        queryFn: async () => {
            if (!ids || ids.length === 0) return [];
            const groups: GroupRepresentation[] = [];
            for (const i of ids) {
                let group: GroupRepresentation | undefined;
                if (i !== "search") {
                    group = await findGroup(adminClient, i);
                } else {
                    group = { name: "searchGroups", id: "search" };
                }
                if (group) {
                    groups.push(group);
                } else {
                    throw new Error("notFound");
                }
            }
            return groups;
        },
        enabled: !!ids && ids.length > 0
    });
}
