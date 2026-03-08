import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "../../../api/groups";
import { useAdminClient } from "../../../app/admin-client";
import { groupKeys } from "./keys";

/**
 * Delete one or more groups.
 */
export function useDeleteGroups() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (groupIds: string[]) => {
            for (const id of groupIds) {
                await deleteGroup(adminClient, id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
