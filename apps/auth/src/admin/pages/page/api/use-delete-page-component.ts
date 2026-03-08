import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePageComponent } from "../../../api/page-components";
import { useAdminClient } from "../../../app/admin-client";
import { pageKeys } from "./keys";

export function useDeletePageComponent() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePageComponent(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        }
    });
}
