import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminEvents } from "../../../api/events";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { eventKeys } from "./keys";

export function useAdminEvents(filters: Record<string, unknown>, resourcePath?: string) {
    const { realm } = useRealm();
    return useQuery<AdminEventRepresentation[]>({
        queryKey: eventKeys.adminEvents(realm, { ...filters, resourcePath }),
        queryFn: () => fetchAdminEvents({ realm, resourcePath, filters })
    });
}
