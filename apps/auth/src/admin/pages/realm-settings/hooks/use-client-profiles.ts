import { useQuery } from "@tanstack/react-query";
import { fetchClientProfiles } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientProfiles() {
    return useQuery({
        queryKey: realmSettingsKeys.clientProfiles(),
        queryFn: () => fetchClientProfiles()
    });
}
