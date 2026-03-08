import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";
import { KEY_PROVIDER_TYPE } from "../shared/lib/util";

// ── Helpers ──────────────────────────────────────────────────────────────

export const sortByPriority = (components: ComponentRepresentation[]) => {
    const sortedComponents = [...components].sort((a, b) => {
        const priorityA = Number(a.config?.priority);
        const priorityB = Number(b.config?.priority);
        return (
            (!Number.isNaN(priorityB) ? priorityB : 0) -
            (!Number.isNaN(priorityA) ? priorityA : 0)
        );
    });
    return sortedComponents;
};

// ── User profile ─────────────────────────────────────────────────────────

export async function fetchUserProfile(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.users.getProfile({ realm });
}

export async function fetchUserProfileGlobal(
    adminClient: KeycloakAdminClient
) {
    return adminClient.users.getProfile();
}

export async function updateUserProfile(
    adminClient: KeycloakAdminClient,
    config: UserProfileConfig & { realm?: string }
) {
    return adminClient.users.updateProfile(config);
}

// ── Default groups ───────────────────────────────────────────────────────

export async function fetchDefaultGroups(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.realms.getDefaultGroups({ realm });
}

export async function addDefaultGroup(
    adminClient: KeycloakAdminClient,
    realm: string,
    groupId: string
) {
    return adminClient.realms.addDefaultGroup({ realm, id: groupId });
}

export async function removeDefaultGroup(
    adminClient: KeycloakAdminClient,
    realm: string,
    groupId: string
) {
    return adminClient.realms.removeDefaultGroup({ realm, id: groupId });
}

// ── Keys ─────────────────────────────────────────────────────────────────

export async function fetchKeyProviderComponents(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    const components = await adminClient.components.find({
        type: KEY_PROVIDER_TYPE,
        realm
    });
    return sortByPriority(components);
}

export async function fetchKeysMetadata(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.realms.getKeys({ realm });
}

export async function findComponent(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.components.findOne({ id });
}

export async function saveComponent(
    adminClient: KeycloakAdminClient,
    id: string | undefined,
    component: ComponentRepresentation
) {
    if (id) {
        await adminClient.components.update(
            { id },
            { ...component, providerType: KEY_PROVIDER_TYPE }
        );
    } else {
        await adminClient.components.create({
            ...component,
            providerType: KEY_PROVIDER_TYPE
        });
    }
}

export async function deleteComponent(
    adminClient: KeycloakAdminClient,
    id: string,
    realm: string
) {
    return adminClient.components.del({ id, realm });
}

// ── Events ───────────────────────────────────────────────────────────────

export async function fetchEventsConfig(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.realms.getConfigEvents({ realm });
}

export async function saveEventsConfig(
    adminClient: KeycloakAdminClient,
    realm: string,
    config: RealmEventsConfigRepresentation
) {
    return adminClient.realms.updateConfigEvents({ realm }, config);
}

export async function clearEvents(
    adminClient: KeycloakAdminClient,
    realm: string,
    type: "admin" | "user"
) {
    if (type === "admin") {
        return adminClient.realms.clearAdminEvents({ realm });
    }
    return adminClient.realms.clearEvents({ realm });
}

type EventListenerRepresentation = {
    id: string;
};

export async function fetchAvailableEventListeners(
    adminClient: KeycloakAdminClient
) {
    return fetchAdminUI<EventListenerRepresentation[]>(
        adminClient,
        "ui-ext/available-event-listeners"
    );
}

// ── Client profiles ──────────────────────────────────────────────────────

export async function fetchClientProfiles(
    adminClient: KeycloakAdminClient
) {
    return adminClient.clientPolicies.listProfiles({
        includeGlobalProfiles: true
    });
}

export async function saveClientProfiles(
    adminClient: KeycloakAdminClient,
    profiles: { profiles?: any[]; globalProfiles?: any[] }
) {
    return adminClient.clientPolicies.createProfiles(profiles);
}

// ── Client policies ──────────────────────────────────────────────────────

export async function fetchClientPolicies(
    adminClient: KeycloakAdminClient
) {
    return adminClient.clientPolicies.listPolicies({
        includeGlobalPolicies: true
    });
}

export async function updateClientPolicy(
    adminClient: KeycloakAdminClient,
    policies: { policies?: any[]; globalPolicies?: any[] }
) {
    return adminClient.clientPolicies.updatePolicy(policies);
}

// ── Client scopes ────────────────────────────────────────────────────────

export async function findClientScopes(
    adminClient: KeycloakAdminClient
) {
    return adminClient.clientScopes.find();
}

// ── Localization texts ───────────────────────────────────────────────────

export async function fetchRealmLocalizationTexts(
    adminClient: KeycloakAdminClient,
    realm: string,
    selectedLocale: string
) {
    return adminClient.realms.getRealmLocalizationTexts({
        realm,
        selectedLocale
    });
}
