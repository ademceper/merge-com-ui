import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteResource } from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function useDeleteResource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            resourceId
        }: {
            clientId: string;
            resourceId: string;
        }) => deleteResource(clientId, resourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
