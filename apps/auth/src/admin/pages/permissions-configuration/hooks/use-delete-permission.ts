import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermission } from "../../../api/permissions";
import { permissionsKeys } from "./keys";

export function useDeletePermission(clientId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ type, permissionId }: { type: string; permissionId: string }) =>
            deletePermission(clientId, type, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: permissionsKeys.all
            });
        }
    });
}
