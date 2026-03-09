import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsConfig } from "@/admin/api/events";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { eventKeys } from "./keys";

export function useEventsConfig() {
    const { realm } = useRealm();
    return useQuery<RealmEventsConfigRepresentation>({
        queryKey: eventKeys.eventsConfig(realm),
        queryFn: () => fetchEventsConfig(realm)
    });
}
