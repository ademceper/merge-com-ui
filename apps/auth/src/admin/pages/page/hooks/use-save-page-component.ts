import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePageComponent } from "../../../api/page-components";
import { pageKeys } from "./keys";

export function useSavePageComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            component
        }: {
            id?: string;
            component: ComponentRepresentation;
        }) => {
            return savePageComponent(id, component);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pageKeys.all });
        }
    });
}
