import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromGroup } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useRemoveUserFromGroups(userId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    removeUserFromGroup(adminClient, userId, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.groups(userId) });
        }
    });
}
