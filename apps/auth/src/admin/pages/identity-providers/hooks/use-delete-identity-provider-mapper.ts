import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdentityProviderMapper } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useDeleteIdentityProviderMapper(alias: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            deleteIdentityProviderMapper(alias, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
