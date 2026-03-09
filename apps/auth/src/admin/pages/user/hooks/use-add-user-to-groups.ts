import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToGroup } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useAddUserToGroups(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    addUserToGroup(userId, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.groups(userId) });
        }
    });
}
