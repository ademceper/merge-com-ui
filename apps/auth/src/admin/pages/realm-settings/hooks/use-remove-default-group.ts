import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { removeDefaultGroup } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useRemoveDefaultGroup() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groups: GroupRepresentation[]) =>
            Promise.all(
                groups.map(group =>
                    removeDefaultGroup(adminClient, realm, group.id!)
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.defaultGroups(realm)
            });
        }
    });
}
