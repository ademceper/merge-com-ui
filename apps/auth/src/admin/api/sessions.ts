import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { adminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

export type FilterType = "ALL" | "REGULAR" | "OFFLINE";

export async function fetchSessions(
    filterType: FilterType
) {
    return fetchAdminUI<UserSessionRepresentation[]>("ui-ext/sessions", {
        first: "0",
        max: "1000",
        type: filterType,
        search: ""
    });
}

export async function logoutAllSessions(realm: string) {
    return adminClient.realms.logoutAll({ realm });
}

export async function updateRealmNotBefore(realm: string, notBefore: number) {
    return adminClient.realms.update(
        { realm },
        { realm, notBefore }
    );
}

export async function pushRevocation(realm: string) {
    return adminClient.realms.pushRevocation({ realm });
}

export async function deleteSession(
    realm: string,
    sessionId: string,
    isOffline: boolean
) {
    return adminClient.realms.deleteSession({
        realm,
        session: sessionId,
        isOffline
    });
}

export async function logoutUser(userId: string) {
    return adminClient.users.logout({ id: userId });
}
