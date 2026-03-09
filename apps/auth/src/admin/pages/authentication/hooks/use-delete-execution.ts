import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExecution } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useDeleteExecution() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteExecution(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
