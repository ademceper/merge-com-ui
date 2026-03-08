import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type CertificateRepresentation from "@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation";
import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";

// ── Clients list ──

export async function findClients(adminClient: KeycloakAdminClient) {
    return adminClient.clients.find({});
}

export async function findClient(adminClient: KeycloakAdminClient, clientId: string) {
    return adminClient.clients.findOne({ id: clientId });
}

export async function deleteClient(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.clients.del({ id });
}

// ── Client sessions ──

export async function fetchClientSessions(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return fetchAdminUI<UserSessionRepresentation[]>(
        adminClient,
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

export async function fetchAuthFlows(adminClient: KeycloakAdminClient) {
    return adminClient.authenticationManagement.getFlows();
}

// ── Credentials ──

export async function fetchClientAuthenticatorProviders(
    adminClient: KeycloakAdminClient
) {
    return adminClient.authenticationManagement.getClientAuthenticatorProviders();
}

export async function fetchClientSecret(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.getClientSecret({ id: clientId });
}

export async function regenerateClientSecret(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.generateNewClientSecret({ id: clientId });
}

export async function regenerateAccessToken(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.generateRegistrationAccessToken({ id: clientId });
}

// ── Initial access tokens ──

export async function fetchInitialAccessTokens(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    try {
        return await adminClient.realms.getClientsInitialAccess({ realm });
    } catch {
        return [] as ClientInitialAccessPresentation[];
    }
}

export async function deleteInitialAccessToken(
    adminClient: KeycloakAdminClient,
    realm: string,
    id: string
) {
    return adminClient.realms.delClientsInitialAccess({ realm, id });
}

// ── Keys (OIDC) ──

export async function fetchClientKeyInfo(
    adminClient: KeycloakAdminClient,
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
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return Promise.all(
        (["saml.signing", "saml.encryption"] as const).map(attr =>
            adminClient.clients.getKeyInfo({ id: clientId, attr })
        )
    );
}

// ── Client registration policies ──

export async function fetchClientRegistrationPolicies(
    adminClient: KeycloakAdminClient
) {
    return adminClient.components.find({
        type: "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy"
    });
}

export async function deleteRegistrationPolicy(
    adminClient: KeycloakAdminClient,
    realm: string,
    id: string
) {
    return adminClient.components.del({ realm, id });
}

// ── Registration provider detail ──

export async function fetchClientRegistrationPolicyProviders(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.realms.getClientRegistrationPolicyProviders({ realm });
}

export async function fetchComponent(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.components.findOne({ id });
}

// ── Client scopes ──

export async function fetchDefaultClientScopes(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.listDefaultClientScopes({ id: clientId });
}

export async function fetchOptionalClientScopes(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.listOptionalClientScopes({ id: clientId });
}

export async function fetchClientScopes(adminClient: KeycloakAdminClient) {
    return adminClient.clientScopes.find();
}

// ── Dedicated scopes ──

export async function fetchDedicatedScopeClient(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.findOne({ id: clientId });
}

// ── Service account ──

export async function fetchServiceAccountUser(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.getServiceAccountUser({ id: clientId });
}
