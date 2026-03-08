import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteExecutionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useDeleteExecutionConfig() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteExecutionConfig(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
