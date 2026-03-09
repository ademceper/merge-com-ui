import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserToGroup } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Add members to a group.
 */
export function useAddGroupMembers(groupId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userIds: string[]) => {
            await Promise.all(
                userIds.map(userId =>
                    addUserToGroup(userId, groupId)
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
