import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { createComponent } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useCreateComponent() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (component: ComponentRepresentation) =>
            createComponent(adminClient, component),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
