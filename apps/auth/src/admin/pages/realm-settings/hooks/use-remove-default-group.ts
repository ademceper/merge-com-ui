import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { removeDefaultGroup } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useRemoveDefaultGroup() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    removeDefaultGroup(realm, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.defaultGroups(realm)
            });
        }
    });
}
