import { type RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchEventsConfig } from "../../../api/events";
import { eventKeys } from "./keys";

export function useEventsConfig() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery<RealmEventsConfigRepresentation>({
        queryKey: eventKeys.eventsConfig(realm),
        queryFn: () => fetchEventsConfig(adminClient, realm)
    });
}
