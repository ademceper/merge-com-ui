import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useDeleteIdentityProvider() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            deleteIdentityProvider(adminClient, alias),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.all });
        }
    });
}
