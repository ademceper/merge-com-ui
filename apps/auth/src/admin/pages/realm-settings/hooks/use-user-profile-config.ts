import { useQuery } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { fetchUserProfile } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useUserProfileConfig(realm?: string) {
    const { realm: currentRealm } = useRealm();
    const realmName = realm ?? currentRealm;
    return useQuery({
        queryKey: realmSettingsKeys.userProfile(realmName),
        queryFn: () => fetchUserProfile(realmName)
    });
}
