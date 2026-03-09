import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchUserEvents } from "@/admin/api/events";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { eventKeys } from "./keys";

export function useUserEvents(
    filters: Record<string, unknown>,
    user?: string,
    client?: string
) {
    const { realm } = useRealm();
    return useQuery<EventRepresentation[]>({
        queryKey: eventKeys.userEvents(realm, { ...filters, user, client }),
        queryFn: () => fetchUserEvents({ realm, user, client, filters })
    });
}
