import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchEventsConfig } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useEventsConfig() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.eventsConfig(realm),
        queryFn: () => fetchEventsConfig(adminClient, realm)
    });
}
