import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchAvailableEventListeners } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useAvailableEventListeners() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.eventListeners(),
        queryFn: () => fetchAvailableEventListeners(adminClient)
    });
}
