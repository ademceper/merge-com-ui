import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExecutionConfig } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useDeleteExecutionConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteExecutionConfig(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
