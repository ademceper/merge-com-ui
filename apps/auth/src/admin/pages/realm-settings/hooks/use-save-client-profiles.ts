import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveClientProfiles } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useSaveClientProfiles() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profiles: { profiles?: any[]; globalProfiles?: any[] }) =>
            saveClientProfiles(profiles),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.clientProfiles()
            });
        }
    });
}
