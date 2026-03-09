import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProtocolMapper } from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useDeleteProtocolMapper(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapperId: string) =>
            deleteProtocolMapper(id, mapperId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });
}
