import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroup } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Update group attributes.
 */
export function useUpdateGroup(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (group: GroupRepresentation) =>
            updateGroup(id, group),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
