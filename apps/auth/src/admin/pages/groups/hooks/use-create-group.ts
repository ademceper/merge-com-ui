import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup, createChildGroup } from "../../../api/groups";
import { groupKeys } from "./keys";

/**
 * Create a top-level group or a child group under a parent.
 */
export function useCreateGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { group: GroupRepresentation; parentId?: string }) => {
            if (params.parentId) {
                return createChildGroup(params.parentId, params.group);
            }
            return createGroup(params.group);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
