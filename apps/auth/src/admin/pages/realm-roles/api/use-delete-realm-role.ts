import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRealmRole } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useDeleteRealmRole() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRealmRole(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roleKeys.lists()
            });
        }
    });
}
