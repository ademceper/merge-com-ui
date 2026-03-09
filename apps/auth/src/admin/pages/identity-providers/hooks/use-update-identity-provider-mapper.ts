import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentityProviderMapper } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useUpdateIdentityProviderMapper(alias: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mapper: IdentityProviderMapperRepresentation) =>
            updateIdentityProviderMapper(alias, mapper),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: idpKeys.mappers(alias)
            });
        }
    });
}
