import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToGroup } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useAddUserToGroups(userId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    addUserToGroup(adminClient, userId, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.groups(userId) });
        }
    });
}
