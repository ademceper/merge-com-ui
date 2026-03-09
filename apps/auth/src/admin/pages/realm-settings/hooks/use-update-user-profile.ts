import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useUpdateUserProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (config: UserProfileConfig & { realm?: string }) =>
            updateUserProfile(config),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.all
            });
        }
    });
}
