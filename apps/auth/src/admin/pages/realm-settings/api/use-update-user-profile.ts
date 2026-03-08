import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateUserProfile } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useUpdateUserProfile() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (config: UserProfileConfig & { realm?: string }) =>
            updateUserProfile(adminClient, config),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.all
            });
        }
    });
}
