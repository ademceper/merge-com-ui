import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromGroup } from "../../../api/groups";
import { groupKeys } from "./keys";

/**
 * Remove a member from a group.
 */
export function useRemoveGroupMembers(groupId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            await Promise.all(
                userIds.map(userId =>
                    removeUserFromGroup(userId, groupId)
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
