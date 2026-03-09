import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComponent } from "@/admin/api/user-federation";
import { federationKeys } from "./keys";

export function useDeleteComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComponent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
