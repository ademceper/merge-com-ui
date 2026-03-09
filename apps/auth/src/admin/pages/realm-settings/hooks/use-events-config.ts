import { useQuery } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { fetchEventsConfig } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useEventsConfig() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.eventsConfig(realm),
        queryFn: () => fetchEventsConfig(realm)
    });
}
