import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteResource } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useDeleteResource() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            resourceId
        }: {
            clientId: string;
            resourceId: string;
        }) => deleteResource(adminClient, clientId, resourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
