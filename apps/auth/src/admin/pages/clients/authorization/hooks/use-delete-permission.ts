import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermission } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useDeletePermission() {
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
        }) => deletePermission(clientId, type, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
