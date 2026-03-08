import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchClientProfiles } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientProfiles() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.clientProfiles(),
        queryFn: () => fetchClientProfiles(adminClient)
    });
}
