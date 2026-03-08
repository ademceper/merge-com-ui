import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProtocolMapper } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useDeleteProtocolMapper(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapperId: string) =>
            deleteProtocolMapper(adminClient, id, mapperId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });
}
