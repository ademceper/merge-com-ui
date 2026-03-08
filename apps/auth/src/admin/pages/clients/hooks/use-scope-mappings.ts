import { useMutation } from "@tanstack/react-query";
import {
    addRealmScopeMappings,
    addClientScopeMappings,
    updateClient
} from "../../../api/clients";

export function useAssignScopeMappings() {
    return useMutation({
        mutationFn: async ({
            clientId,
            realmRoles,
            clientRoles
        }: {
            clientId: string;
            realmRoles: Record<string, unknown>[];
            clientRoles: { targetClientId: string; roles: Record<string, unknown>[] }[];
        }) => {
            await Promise.all([
                addRealmScopeMappings(clientId, realmRoles),
                ...clientRoles.map(({ targetClientId, roles }) =>
                    addClientScopeMappings(clientId, targetClientId, roles)
                )
            ]);
        }
    });
}

export function useUpdateClientFullScope() {
    return useMutation({
        mutationFn: ({ clientId, client }: { clientId: string; client: Record<string, unknown> }) =>
            updateClient(clientId, client)
    });
}
