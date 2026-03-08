import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientRole } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useDeleteClientRole(clientId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roleName: string) =>
            deleteClientRole(adminClient, clientId, roleName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }
    });
}
