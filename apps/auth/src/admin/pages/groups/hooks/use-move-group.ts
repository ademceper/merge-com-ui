import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoot, updateChildGroup } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Move a group to root or under another parent group.
 */
export function useMoveGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            source: GroupRepresentation;
            dest?: GroupRepresentation;
        }) => {
            if (params.dest) {
                return updateChildGroup(params.dest.id!, params.source);
            }
            return params.source.id
                ? updateRoot(params.source)
                : (await import("../../../api/groups")).createGroup(params.source);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
