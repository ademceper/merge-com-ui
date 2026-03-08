import type CertificateRepresentation from "@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation";
import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { adminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

// ── Clients list ──

export async function findClients() {
    return adminClient.clients.find({});
}

export async function findClient(clientId: string) {
    return adminClient.clients.findOne({ id: clientId });
}

export async function deleteClient(id: string) {
    return adminClient.clients.del({ id });
}

// ── Client sessions ──

export async function fetchClientSessions(
    clientId: string
) {
    return fetchAdminUI<UserSessionRepresentation[]>(
        "ui-ext/sessions/client",
        {
            first: "0",
            max: "1000",
            type: "ALL",
            clientId,
            search: ""
        }
    );
}

// ── Authentication flows ──

export async function fetchAuthFlows() {
    return adminClient.authenticationManagement.getFlows();
}

// ── Credentials ──

export async function fetchClientAuthenticatorProviders() {
    return adminClient.authenticationManagement.getClientAuthenticatorProviders();
}

export async function fetchClientSecret(
    clientId: string
) {
    return adminClient.clients.getClientSecret({ id: clientId });
}

export async function regenerateClientSecret(
    clientId: string
) {
    return adminClient.clients.generateNewClientSecret({ id: clientId });
}

export async function regenerateAccessToken(
    clientId: string
) {
    return adminClient.clients.generateRegistrationAccessToken({ id: clientId });
}

// ── Initial access tokens ──

export async function fetchInitialAccessTokens(
    realm: string
) {
    try {
        return await adminClient.realms.getClientsInitialAccess({ realm });
    } catch {
        return [] as ClientInitialAccessPresentation[];
    }
}

export async function deleteInitialAccessToken(
    realm: string,
    id: string
) {
    return adminClient.realms.delClientsInitialAccess({ realm, id });
}

// ── Keys (OIDC) ──

export async function fetchClientKeyInfo(
    clientId: string,
    attr: string
) {
    try {
        return await adminClient.clients.getKeyInfo({ id: clientId, attr });
    } catch {
        return {} as CertificateRepresentation;
    }
}

// ── SAML keys ──

export async function fetchSamlKeyInfo(
    clientId: string
) {
    return Promise.all(
        (["saml.signing", "saml.encryption"] as const).map(attr =>
            adminClient.clients.getKeyInfo({ id: clientId, attr })
        )
    );
}

// ── Client registration policies ──

export async function fetchClientRegistrationPolicies() {
    return adminClient.components.find({
        type: "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy"
    });
}

export async function deleteRegistrationPolicy(
    realm: string,
    id: string
) {
    return adminClient.components.del({ realm, id });
}

// ── Registration provider detail ──

export async function fetchClientRegistrationPolicyProviders(
    realm: string
) {
    return adminClient.realms.getClientRegistrationPolicyProviders({ realm });
}

export async function fetchComponent(id: string) {
    return adminClient.components.findOne({ id });
}

// ── Client scopes ──

export async function fetchDefaultClientScopes(
    clientId: string
) {
    return adminClient.clients.listDefaultClientScopes({ id: clientId });
}

export async function fetchOptionalClientScopes(
    clientId: string
) {
    return adminClient.clients.listOptionalClientScopes({ id: clientId });
}

export async function fetchClientScopes() {
    return adminClient.clientScopes.find();
}

// ── Dedicated scopes ──

export async function fetchDedicatedScopeClient(
    clientId: string
) {
    return adminClient.clients.findOne({ id: clientId });
}

// ── Service account ──

export async function fetchServiceAccountUser(
    clientId: string
) {
    return adminClient.clients.getServiceAccountUser({ id: clientId });
}

// ── Client CRUD ──

export async function createClient(
    client: Record<string, unknown>
) {
    return adminClient.clients.create(client);
}

export async function updateClient(
    clientId: string,
    client: Record<string, unknown>
) {
    return adminClient.clients.update({ id: clientId }, client);
}

// ── Roles ──

export async function listClientRoles(clientId: string) {
    return adminClient.clients.listRoles({ id: clientId });
}

export async function createClientRole(
    clientId: string,
    role: Record<string, unknown>
) {
    return adminClient.clients.createRole({ id: clientId, ...role });
}

export async function findClientRole(
    clientId: string,
    roleName: string
) {
    return adminClient.clients.findRole({ id: clientId, roleName });
}

// ── Clustering ──

export async function addClusterNode(
    clientId: string,
    node: string
) {
    return adminClient.clients.addClusterNode({ id: clientId, node });
}

export async function deleteClusterNode(
    clientId: string,
    node: string
) {
    return adminClient.clients.deleteClusterNode({ id: clientId, node });
}

export async function testNodesAvailable(clientId: string) {
    return adminClient.clients.testNodesAvailable({ id: clientId });
}

// ── Secret management ──

export async function invalidateClientSecret(clientId: string) {
    return adminClient.clients.invalidateSecret({ id: clientId });
}

// ── Initial access tokens (create) ──

export async function createClientsInitialAccess(
    realm: string,
    token: Record<string, unknown>
) {
    return adminClient.realms.createClientsInitialAccess({ realm }, token);
}

// ── Key generation / import / export ──

export async function generateAndDownloadKey(
    clientId: string,
    attr: string,
    config: Record<string, unknown>
) {
    return adminClient.clients.generateAndDownloadKey(
        { id: clientId, attr },
        config
    );
}

export async function uploadCertificate(
    clientId: string,
    attr: string,
    formData: FormData
) {
    return adminClient.clients.uploadCertificate(
        { id: clientId, attr },
        formData
    );
}

export async function generateKey(
    clientId: string,
    attr: string
) {
    return adminClient.clients.generateKey({ id: clientId, attr });
}

export async function uploadKey(
    clientId: string,
    attr: string,
    formData: FormData
) {
    return adminClient.clients.uploadKey({ id: clientId, attr }, formData);
}

export async function downloadKey(
    clientId: string,
    attr: string,
    config: Record<string, unknown>
) {
    return adminClient.clients.downloadKey(
        { id: clientId, attr },
        config
    );
}

// ── Component CRUD (registration policies) ──

export async function createComponent(
    component: Record<string, unknown>
) {
    return adminClient.components.create(component);
}

export async function updateComponent(
    id: string,
    component: Record<string, unknown>
) {
    return adminClient.components.update({ id }, component);
}

export async function deleteComponent(
    realm: string,
    id: string
) {
    return adminClient.components.del({ realm, id });
}

// ── Protocol mappers ──

export async function addMultipleProtocolMappers(
    clientId: string,
    mappers: Record<string, unknown>[]
) {
    return adminClient.clients.addMultipleProtocolMappers(
        { id: clientId },
        mappers
    );
}

export async function delProtocolMapper(
    clientId: string,
    mapperId: string
) {
    return adminClient.clients.delProtocolMapper({
        id: clientId,
        mapperId
    });
}

// ── Scope mappings (dedicated scope) ──

export async function addRealmScopeMappings(
    clientId: string,
    roles: Record<string, unknown>[]
) {
    return adminClient.clients.addRealmScopeMappings(
        { id: clientId },
        roles
    );
}

export async function addClientScopeMappings(
    clientId: string,
    targetClientId: string,
    roles: Record<string, unknown>[]
) {
    return adminClient.clients.addClientScopeMappings(
        { id: clientId, client: targetClientId },
        roles
    );
}

// ── Service account role mappings ──

export async function addUserRealmRoleMappings(
    userId: string,
    roles: Record<string, unknown>[]
) {
    return adminClient.users.addRealmRoleMappings({ id: userId, roles });
}

export async function addUserClientRoleMappings(
    userId: string,
    clientUniqueId: string,
    roles: Record<string, unknown>[]
) {
    return adminClient.users.addClientRoleMappings({
        id: userId,
        clientUniqueId,
        roles
    });
}

// ── Evaluate scopes ──

export async function evaluatePermission(
    clientId: string,
    realm: string,
    scope: string
) {
    return adminClient.clients.evaluatePermission({
        id: clientId,
        roleContainer: realm,
        scope,
        type: "granted"
    });
}

export async function evaluateListProtocolMapper(
    clientId: string,
    scope: string
) {
    return adminClient.clients.evaluateListProtocolMapper({
        id: clientId,
        scope
    });
}

export async function evaluateGenerateAccessToken(
    clientId: string,
    userId: string,
    scope: string,
    audience: string
) {
    return adminClient.clients.evaluateGenerateAccessToken({
        id: clientId,
        userId,
        scope,
        audience
    });
}

export async function evaluateGenerateUserInfo(
    clientId: string,
    userId: string,
    scope: string
) {
    return adminClient.clients.evaluateGenerateUserInfo({
        id: clientId,
        userId,
        scope
    });
}

export async function evaluateGenerateIdToken(
    clientId: string,
    userId: string,
    scope: string
) {
    return adminClient.clients.evaluateGenerateIdToken({
        id: clientId,
        userId,
        scope
    });
}

// ── Admin client singleton access (for import-form) ──

export function getAdminClientBaseUrl() {
    return adminClient.baseUrl;
}

export async function getAdminClientAccessToken() {
    return adminClient.getAccessToken();
}
