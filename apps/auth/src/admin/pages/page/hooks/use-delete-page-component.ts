import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePageComponent } from "@/admin/api/page-components";
import { pageKeys } from "./keys";

export function useDeletePageComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePageComponent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        }
    });
}
