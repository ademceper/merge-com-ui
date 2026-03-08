import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteComponent } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useDeleteComponent() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComponent(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
