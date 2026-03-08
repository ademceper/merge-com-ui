import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteIdentityProviderMapper } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useDeleteIdentityProviderMapper(alias: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            deleteIdentityProviderMapper(adminClient, alias, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
