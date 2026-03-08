import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProtocolMappers } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useAddProtocolMappers(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (mappers: ProtocolMapperRepresentation[]) =>
            addProtocolMappers(adminClient, id, mappers),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });
}
