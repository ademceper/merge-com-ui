import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientRole } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useDeleteClientRole(clientId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roleName: string) =>
            deleteClientRole(clientId, roleName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }
    });
}
