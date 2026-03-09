import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/admin/api/groups";
import { groupKeys } from "./keys";

/**
 * Delete one or more groups.
 */
export function useDeleteGroups() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (groupIds: string[]) => {
            for (const id of groupIds) {
                await deleteGroup(id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        }
    });
}
