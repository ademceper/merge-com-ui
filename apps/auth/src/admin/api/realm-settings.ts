import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { RealmEventsConfigRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation";
import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { adminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";
import { KEY_PROVIDER_TYPE } from "../shared/lib/util";

// ── Helpers ──────────────────────────────────────────────────────────────

const sortByPriority = (components: ComponentRepresentation[]) => {
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

export async function fetchUserProfile(realm: string) {
    return adminClient.users.getProfile({ realm });
}

export async function fetchUserProfileGlobal() {
    return adminClient.users.getProfile();
}

export async function updateUserProfile(
    config: UserProfileConfig & { realm?: string }
) {
    return adminClient.users.updateProfile(config);
}

// ── Default groups ───────────────────────────────────────────────────────

export async function fetchDefaultGroups(
    realm: string
) {
    return adminClient.realms.getDefaultGroups({ realm });
}

export async function addDefaultGroup(
    realm: string,
    groupId: string
) {
    return adminClient.realms.addDefaultGroup({ realm, id: groupId });
}

export async function removeDefaultGroup(
    realm: string,
    groupId: string
) {
    return adminClient.realms.removeDefaultGroup({ realm, id: groupId });
}

// ── Keys ─────────────────────────────────────────────────────────────────

export async function fetchKeyProviderComponents(
    realm: string
) {
    const components = await adminClient.components.find({
        type: KEY_PROVIDER_TYPE,
        realm
    });
    return sortByPriority(components);
}

export async function fetchKeysMetadata(realm: string) {
    return adminClient.realms.getKeys({ realm });
}

export async function findComponent(id: string) {
    return adminClient.components.findOne({ id });
}

export async function saveComponent(
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
    id: string,
    realm: string
) {
    return adminClient.components.del({ id, realm });
}

// ── Events ───────────────────────────────────────────────────────────────

export async function fetchEventsConfig(realm: string) {
    return adminClient.realms.getConfigEvents({ realm });
}

export async function saveEventsConfig(
    realm: string,
    config: RealmEventsConfigRepresentation
) {
    return adminClient.realms.updateConfigEvents({ realm }, config);
}

export async function clearEvents(
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

export async function fetchAvailableEventListeners() {
    return fetchAdminUI<EventListenerRepresentation[]>(
        "ui-ext/available-event-listeners"
    );
}

// ── Client profiles ──────────────────────────────────────────────────────

export async function fetchClientProfiles() {
    return adminClient.clientPolicies.listProfiles({
        includeGlobalProfiles: true
    });
}

export async function saveClientProfiles(
    profiles: { profiles?: any[]; globalProfiles?: any[] }
) {
    return adminClient.clientPolicies.createProfiles(profiles);
}

// ── Client policies ──────────────────────────────────────────────────────

export async function fetchClientPolicies() {
    return adminClient.clientPolicies.listPolicies({
        includeGlobalPolicies: true
    });
}

export async function updateClientPolicy(
    policies: { policies?: any[]; globalPolicies?: any[] }
) {
    return adminClient.clientPolicies.updatePolicy(policies);
}

// ── Client scopes ────────────────────────────────────────────────────────

export async function findClientScopes() {
    return adminClient.clientScopes.find();
}

// ── Localization texts ───────────────────────────────────────────────────

export async function fetchRealmLocalizationTexts(
    realm: string,
    selectedLocale: string
) {
    return adminClient.realms.getRealmLocalizationTexts({
        realm,
        selectedLocale
    });
}

export async function deleteRealmLocalizationTexts(
    realm: string,
    selectedLocale: string,
    key: string
) {
    return adminClient.realms.deleteRealmLocalizationTexts({
        realm,
        selectedLocale,
        key
    });
}

export async function addLocalization(
    realm: string,
    selectedLocale: string,
    key: string,
    value: string
) {
    return adminClient.realms.addLocalization(
        { realm, selectedLocale, key },
        value
    );
}

// ── Realm mutations ─────────────────────────────────────────────────────

export async function updateRealm(
    realm: string,
    rep: Record<string, unknown>
) {
    return adminClient.realms.update({ realm }, rep);
}

export async function deleteRealm(realm: string) {
    return adminClient.realms.del({ realm });
}

export async function testSMTPConnection(
    realm: string,
    settings: Record<string, string>
) {
    return adminClient.realms.testSMTPConnection({ realm }, settings);
}

export async function exportRealm(
    realm: string,
    options: { exportClients?: boolean; exportGroupsAndRoles?: boolean }
) {
    return adminClient.realms.export({
        realm,
        ...options
    });
}

export async function partialImport(
    realm: string,
    rep: unknown
) {
    return adminClient.realms.partialImport({ realm, rep });
}

// ── Admin client config ──────────────────────────────────────────────────

export function setAdminClientRealmConfig(realmName: string) {
    adminClient.setConfig({ realmName });
}

// ── Server info ─────────────────────────────────────────────────────────

export async function findEffectiveMessageBundles(params: {
    realm: string;
    theme: string;
    themeType: string;
    locale: string;
    source?: boolean;
}) {
    return adminClient.serverInfo.findEffectiveMessageBundles(params);
}

// ── Roles ───────────────────────────────────────────────────────────────

export async function createCompositeRole(
    roleId: string,
    roles: { id: string; name: string }[]
) {
    return adminClient.roles.createComposite({ roleId }, roles);
}

// ── Admin client helpers ─────────────────────────────────────────────────

export function getAdminClientBaseUrl() {
    return adminClient.baseUrl;
}

export async function getAdminClientAccessToken() {
    return adminClient.getAccessToken();
}
