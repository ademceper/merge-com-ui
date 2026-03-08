import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermission } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useDeletePermission(clientId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ type, permissionId }: { type: string; permissionId: string }) =>
            deletePermission(adminClient, clientId, type, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: permissionsKeys.all
            });
        }
    });
}
