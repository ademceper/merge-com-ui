import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Update group attributes.
 */
export function useUpdateGroup(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (group: GroupRepresentation) =>
            updateGroup(adminClient, id, group),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
