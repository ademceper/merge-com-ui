import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";

// --- Query functions ---

export async function findIdentityProviders(
    adminClient: KeycloakAdminClient,
    params?: { realmOnly?: boolean }
) {
    return adminClient.identityProviders.find({
        first: 0,
        max: 1000,
        realmOnly: params?.realmOnly
    } as IdentityProvidersQuery);
}

export async function findIdentityProviderExists(
    adminClient: KeycloakAdminClient
) {
    const firstPage = await adminClient.identityProviders.find({
        max: 1
    });
    return (firstPage?.length ?? 0) > 0;
}

export async function findIdentityProvider(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.identityProviders.findOne({ alias });
}

export async function findIdentityProviderMappers(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.identityProviders.findMappers({ alias });
}

export async function findIdentityProviderMapperTypes(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.identityProviders.findMapperTypes({ alias });
}

export async function findIdentityProviderMapper(
    adminClient: KeycloakAdminClient,
    alias: string,
    id: string
) {
    return adminClient.identityProviders.findOneMapper({ alias, id });
}

export async function findOrgIdentityProviders(
    adminClient: KeycloakAdminClient,
    orgId: string
) {
    return adminClient.organizations.listIdentityProviders({ orgId });
}

export async function fetchBasicFlows(adminClient: KeycloakAdminClient) {
    const flows = await adminClient.authenticationManagement.getFlows();
    return flows.filter(
        (flow: AuthenticationFlowRepresentation) =>
            flow.providerId === "basic-flow"
    );
}

// --- Mutation functions ---

export async function createIdentityProvider(
    adminClient: KeycloakAdminClient,
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.create(provider);
}

export async function updateIdentityProvider(
    adminClient: KeycloakAdminClient,
    alias: string,
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.update({ alias }, provider);
}

export async function deleteIdentityProvider(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.identityProviders.del({ alias });
}

export async function updateIdentityProviderOrder(
    adminClient: KeycloakAdminClient,
    providers: { alias: string; provider: IdentityProviderRepresentation }[]
) {
    return Promise.all(
        providers.map(({ alias, provider }) =>
            adminClient.identityProviders.update({ alias }, provider)
        )
    );
}

export async function createIdentityProviderMapper(
    adminClient: KeycloakAdminClient,
    alias: string,
    mapper: IdentityProviderMapperRepresentation
) {
    return adminClient.identityProviders.createMapper({
        identityProviderMapper: {
            ...mapper,
            identityProviderAlias: alias
        },
        alias
    });
}

export async function updateIdentityProviderMapper(
    adminClient: KeycloakAdminClient,
    alias: string,
    mapper: IdentityProviderMapperRepresentation
) {
    return adminClient.identityProviders.updateMapper(
        { id: mapper.id!, alias },
        mapper
    );
}

export async function deleteIdentityProviderMapper(
    adminClient: KeycloakAdminClient,
    alias: string,
    id: string
) {
    return adminClient.identityProviders.delMapper({ alias, id });
}

export async function importFromUrl(
    adminClient: KeycloakAdminClient,
    params: { providerId: string; fromUrl: string }
) {
    return adminClient.identityProviders.importFromUrl(params);
}

export async function reloadKeys(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.identityProviders.reloadKeys({ alias });
}
