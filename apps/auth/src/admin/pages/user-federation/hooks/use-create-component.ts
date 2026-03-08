import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComponent } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useCreateComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (component: ComponentRepresentation) =>
            createComponent(component),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
