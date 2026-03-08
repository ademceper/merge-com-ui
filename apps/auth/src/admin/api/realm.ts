import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { adminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

export type RealmNameRepresentation = {
    name: string;
    displayName?: string;
};

export async function fetchRealmNames() {
    const result = await fetchAdminUI<RealmNameRepresentation[]>(
        "ui-ext/realms/names",
        { first: "0", max: "1000" }
    );
    return result ?? [];
}

export async function deleteRealms(realmNames: string[]) {
    return Promise.all(
        realmNames.map(realmName =>
            adminClient.realms.del({ realm: realmName })
        )
    );
}

export async function createRealm(realm: RealmRepresentation) {
    return adminClient.realms.create(realm);
}
