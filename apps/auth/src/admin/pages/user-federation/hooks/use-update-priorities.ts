import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComponentPriorities } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useUpdatePriorities() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: { id: string; component: ComponentRepresentation }[]) =>
            updateComponentPriorities(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
