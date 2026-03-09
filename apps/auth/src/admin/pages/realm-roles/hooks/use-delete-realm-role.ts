import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRealmRole } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useDeleteRealmRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRealmRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roleKeys.lists()
            });
        }
    });
}
