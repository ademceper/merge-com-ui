import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermission } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useDeletePermission() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            permissionId
        }: {
            clientId: string;
            type: string;
            permissionId: string;
        }) => deletePermission(adminClient, clientId, type, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
