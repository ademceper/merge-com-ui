import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Add members to a group.
 */
export function useAddGroupMembers(groupId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            await Promise.all(
                userIds.map(userId =>
                    addUserToGroup(adminClient, userId, groupId)
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
