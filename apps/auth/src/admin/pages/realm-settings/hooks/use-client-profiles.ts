import { useQuery } from "@tanstack/react-query";
import { fetchClientProfiles } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientProfiles() {
    return useQuery({
        queryKey: realmSettingsKeys.clientProfiles(),
        queryFn: () => fetchClientProfiles()
    });
}
