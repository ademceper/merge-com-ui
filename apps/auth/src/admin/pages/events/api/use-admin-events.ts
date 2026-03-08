import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchAdminEvents } from "../../../api/events";
import { eventKeys } from "./keys";

export function useAdminEvents(filters: Record<string, unknown>, resourcePath?: string) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery<AdminEventRepresentation[]>({
        queryKey: eventKeys.adminEvents(realm, { ...filters, resourcePath }),
        queryFn: () =>
            fetchAdminEvents(adminClient, { realm, resourcePath, filters })
    });
}
