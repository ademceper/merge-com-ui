import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProtocolMappers } from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useAddProtocolMappers(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mappers: ProtocolMapperRepresentation[]) =>
            addProtocolMappers(id, mappers),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });
}
