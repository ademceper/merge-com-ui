import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useDeleteClient() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteClient(adminClient, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}
