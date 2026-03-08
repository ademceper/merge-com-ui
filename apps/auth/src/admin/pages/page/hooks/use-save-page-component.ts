import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePageComponent } from "../../../api/page-components";
import { useAdminClient } from "../../../app/admin-client";
import { pageKeys } from "./keys";

export function useSavePageComponent() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            component
        }: {
            id?: string;
            component: ComponentRepresentation;
        }) => {
            return savePageComponent(adminClient, id, component);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        }
    });
}
