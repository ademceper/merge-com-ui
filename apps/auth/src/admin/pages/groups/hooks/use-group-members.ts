import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useQuery } from "@tanstack/react-query";
import { uniqBy } from "lodash-es";
import { fetchGroupMembers, findSubGroups } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Fetch members of a group, optionally including sub-group members.
 */
export function useGroupMembers(
    groupId: string | undefined,
    options?: {
        includeSubGroup?: boolean;
        currentGroup?: GroupRepresentation;
    }
) {
    const includeSubGroup = options?.includeSubGroup ?? false;
    const currentGroup = options?.currentGroup;

    const getSubGroups = async (gId?: string, count = 0) => {
        let nestedGroups: GroupRepresentation[] = [];
        if (!count || !gId) return nestedGroups;
        const subGroups = await findSubGroups(gId, 0, count);
        nestedGroups = nestedGroups.concat(subGroups);
        await Promise.all(subGroups.map(g => getSubGroups(g.id, g.subGroupCount))).then(
            values => {
                values.forEach(groups => (nestedGroups = nestedGroups.concat(groups)));
            }
        );
        return nestedGroups;
    };

    return useQuery({
        queryKey: groupKeys.members(groupId ?? "", {
            includeSubGroup,
            currentGroupId: currentGroup?.id,
            subGroupCount: currentGroup?.subGroupCount
        }),
        queryFn: async () => {
            if (!groupId) return [];
            let list = await fetchGroupMembers(
                groupId,
                true,
                0,
                500
            );
            if (includeSubGroup && currentGroup?.subGroupCount && currentGroup.id) {
                const subGroups = await getSubGroups(
                    currentGroup.id,
                    currentGroup.subGroupCount
                );
                const values = await Promise.all(
                    subGroups.map(g =>
                        fetchGroupMembers(g.id!, true)
                    )
                );
                values.forEach(users => (list = list.concat(users)));
                list = uniqBy(list, member => member.username);
            }
            return list;
        },
        enabled: !!groupId
    });
}
