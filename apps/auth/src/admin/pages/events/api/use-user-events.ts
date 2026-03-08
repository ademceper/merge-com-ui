import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchUserEvents } from "../../../api/events";
import { eventKeys } from "./keys";

export function useUserEvents(
    filters: Record<string, unknown>,
    user?: string,
    client?: string
) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery<EventRepresentation[]>({
        queryKey: eventKeys.userEvents(realm, { ...filters, user, client }),
        queryFn: () =>
            fetchUserEvents(adminClient, { realm, user, client, filters })
    });
}
