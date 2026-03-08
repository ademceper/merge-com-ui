import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

export type FilterType = "ALL" | "REGULAR" | "OFFLINE";

export async function fetchSessions(
    adminClient: KeycloakAdminClient,
    filterType: FilterType
) {
    return fetchAdminUI<UserSessionRepresentation[]>(adminClient, "ui-ext/sessions", {
        first: "0",
        max: "1000",
        type: filterType,
        search: ""
    });
}

export async function logoutAllSessions(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.realms.logoutAll({ realm });
}
