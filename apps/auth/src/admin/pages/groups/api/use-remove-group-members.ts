import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Remove a member from a group.
 */
export function useRemoveGroupMembers(groupId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            await Promise.all(
                userIds.map(userId =>
                    removeUserFromGroup(adminClient, userId, groupId)
                )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupKeys.members(groupId)
            });
        }
    });
}
