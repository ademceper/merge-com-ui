import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useQuery } from "@tanstack/react-query";
import { sortBy, uniqBy } from "lodash-es";
import { fetchUserGroups } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Fetch user group memberships (for the memberships modal).
 */
export function useUserMemberships(userId: string, isDirectMembership: boolean) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: groupKeys.memberships(userId, { isDirectMembership }),
        queryFn: async () => {
            const joinedUserGroups = await fetchUserGroups(
                adminClient,
                userId,
                0,
                500
            );
            const indirect: GroupRepresentation[] = [];
            if (!isDirectMembership) {
                joinedUserGroups.forEach(g => {
                    const paths = (
                        g.path?.substring(1).match(/((~\/)|[^/])+/g) || []
                    ).slice(0, -1);
                    indirect.push(
                        ...paths.map(
                            p =>
                                ({
                                    name: p,
                                    path: g.path?.substring(
                                        0,
                                        g.path!.indexOf(p) + p.length
                                    )
                                }) as GroupRepresentation
                        )
                    );
                });
            }
            return sortBy(uniqBy([...joinedUserGroups, ...indirect], "path"), group =>
                group.path?.toUpperCase()
            );
        }
    });
}
