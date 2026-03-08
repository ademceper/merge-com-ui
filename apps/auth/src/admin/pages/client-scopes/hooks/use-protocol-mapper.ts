import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addClientProtocolMapper,
    addProtocolMapper,
    deleteProtocolMapperFromClient,
    deleteProtocolMapperFromScope,
    findClientProtocolMapper,
    findClientScope,
    findProtocolMapper,
    updateClientProtocolMapper,
    updateProtocolMapper
} from "../../../api/client-scopes";
import { findClientDetail } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useProtocolMapper(
    id: string,
    mapperId: string,
    isUpdating: boolean,
    isOnClientScope: boolean
) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: clientScopeKeys.protocolMapper(id, mapperId),
        queryFn: async () => {
            if (isUpdating) {
                const data = isOnClientScope
                    ? await findProtocolMapper(adminClient, id, mapperId)
                    : await findClientProtocolMapper(adminClient, id, mapperId);
                if (!data) {
                    throw new Error("Protocol mapper not found");
                }
                return {
                    config: {
                        protocol: data.protocol,
                        protocolMapper: data.protocolMapper
                    },
                    data
                };
            } else {
                const model = isOnClientScope
                    ? await findClientScope(adminClient, id)
                    : await findClientDetail(adminClient, id);
                if (!model) {
                    throw new Error("Model not found");
                }
                return {
                    config: {
                        protocol: model.protocol,
                        protocolMapper: mapperId
                    },
                    data: undefined
                };
            }
        }
    });

    const saveMutation = useMutation({
        mutationFn: async ({
            mapping,
            isUpdate
        }: {
            mapping: ProtocolMapperRepresentation;
            isUpdate: boolean;
        }) => {
            if (isUpdate) {
                if (isOnClientScope) {
                    await updateProtocolMapper(adminClient, id, mapperId, mapping);
                } else {
                    await updateClientProtocolMapper(adminClient, id, mapperId, mapping);
                }
            } else {
                if (isOnClientScope) {
                    await addProtocolMapper(adminClient, id, mapping);
                } else {
                    await addClientProtocolMapper(adminClient, id, mapping);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.protocolMapper(id, mapperId)
            });
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (isOnClientScope) {
                await deleteProtocolMapperFromScope(adminClient, id, mapperId);
            } else {
                await deleteProtocolMapperFromClient(adminClient, id, mapperId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
        }
    });

    return { query, saveMutation, deleteMutation };
}
