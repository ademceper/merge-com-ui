import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { addDefaultGroup } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useAddDefaultGroup() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    addDefaultGroup(realm, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.defaultGroups(realm)
            });
        }
    });
}
