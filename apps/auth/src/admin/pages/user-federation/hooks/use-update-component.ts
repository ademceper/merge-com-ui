import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateComponent } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useUpdateComponent() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            component
        }: {
            id: string;
            component: ComponentRepresentation;
        }) => updateComponent(adminClient, id, component),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: federationKeys.all
            });
        }
    });
}
