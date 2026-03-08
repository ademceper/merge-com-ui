import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { saveClientProfiles } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useSaveClientProfiles() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profiles: { profiles?: any[]; globalProfiles?: any[] }) =>
            saveClientProfiles(adminClient, profiles),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.clientProfiles()
            });
        }
    });
}
