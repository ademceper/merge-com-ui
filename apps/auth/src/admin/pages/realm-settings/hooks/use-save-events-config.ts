import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { saveEventsConfig } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useSaveEventsConfig() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (config: RealmEventsConfigRepresentation) =>
            saveEventsConfig(realm, config),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.eventsConfig(realm)
            });
        }
    });
}
