import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveComponent } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useSaveComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            component
        }: {
            id?: string;
            component: ComponentRepresentation;
        }) => {
            await saveComponent(id, component);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.all
            });
        }
    });
}
