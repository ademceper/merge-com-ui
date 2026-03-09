import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useDeleteClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}
