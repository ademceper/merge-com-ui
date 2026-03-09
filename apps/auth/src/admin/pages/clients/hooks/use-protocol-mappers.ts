import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMultipleProtocolMappers, delProtocolMapper } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useAddMultipleProtocolMappers() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            mappers
        }: {
            clientId: string;
            mappers: Record<string, unknown>[];
        }) => addMultipleProtocolMappers(clientId, mappers),
        onSuccess: (_data, { clientId }) => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.detail(clientId)
            });
        }
    });
}

export function useDelProtocolMapper() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, mapperId }: { clientId: string; mapperId: string }) =>
            delProtocolMapper(clientId, mapperId),
        onSuccess: (_data, { clientId }) => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.detail(clientId)
            });
        }
    });
}
