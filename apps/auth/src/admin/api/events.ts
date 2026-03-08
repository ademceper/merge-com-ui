import type AdminEventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation";
import type EventRepresentation from "@keycloak/keycloak-admin-client/lib/defs/eventRepresentation";
import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import { adminClient } from "../app/admin-client";

export async function fetchEventsConfig(
    realm: string
): Promise<RealmEventsConfigRepresentation> {
    return adminClient.realms.getConfigEvents({ realm });
}

export async function fetchAdminEvents(
    params: { realm: string; resourcePath?: string; filters: Record<string, unknown> }
): Promise<AdminEventRepresentation[]> {
    return adminClient.realms.findAdminEvents({
        resourcePath: params.resourcePath,
        ...params.filters,
        realm: params.realm,
        first: 0,
        max: 1000
    });
}

export async function fetchUserEvents(
    params: {
        realm: string;
        user?: string;
        client?: string;
        filters: Record<string, unknown>;
    }
): Promise<EventRepresentation[]> {
    return adminClient.realms.findEvents({
        client: params.client,
        user: params.user,
        ...params.filters,
        realm: params.realm,
        first: 0,
        max: 1000
    });
}
