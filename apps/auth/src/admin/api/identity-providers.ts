import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type { IdentityProvidersQuery } from "@keycloak/keycloak-admin-client/lib/resources/identityProviders";
import { adminClient } from "../app/admin-client";

// --- Query functions ---

export async function findIdentityProviders(
    params?: { realmOnly?: boolean }
) {
    return adminClient.identityProviders.find({
        first: 0,
        max: 1000,
        realmOnly: params?.realmOnly
    } as IdentityProvidersQuery);
}

export async function findIdentityProviderExists() {
    const firstPage = await adminClient.identityProviders.find({
        max: 1
    });
    return (firstPage?.length ?? 0) > 0;
}

export async function findIdentityProvider(
    alias: string
) {
    return adminClient.identityProviders.findOne({ alias });
}

export async function findIdentityProviderMappers(
    alias: string
) {
    return adminClient.identityProviders.findMappers({ alias });
}

export async function findIdentityProviderMapperTypes(
    alias: string
) {
    return adminClient.identityProviders.findMapperTypes({ alias });
}

export async function findIdentityProviderMapper(
    alias: string,
    id: string
) {
    return adminClient.identityProviders.findOneMapper({ alias, id });
}

export async function findOrgIdentityProviders(
    orgId: string
) {
    return adminClient.organizations.listIdentityProviders({ orgId });
}

export async function fetchBasicFlows() {
    const flows = await adminClient.authenticationManagement.getFlows();
    return flows.filter(
        (flow: AuthenticationFlowRepresentation) => flow.providerId === "basic-flow"
    );
}

// --- Mutation functions ---

export async function createIdentityProvider(
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.create(provider);
}

export async function updateIdentityProvider(
    alias: string,
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.update({ alias }, provider);
}

export async function deleteIdentityProvider(
    alias: string
) {
    return adminClient.identityProviders.del({ alias });
}

export async function updateIdentityProviderOrder(
    providers: { alias: string; provider: IdentityProviderRepresentation }[]
) {
    return Promise.all(
        providers.map(({ alias, provider }) =>
            adminClient.identityProviders.update({ alias }, provider)
        )
    );
}

export async function createIdentityProviderMapper(
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
    alias: string,
    mapper: IdentityProviderMapperRepresentation
) {
    return adminClient.identityProviders.updateMapper({ id: mapper.id!, alias }, mapper);
}

export async function deleteIdentityProviderMapper(
    alias: string,
    id: string
) {
    return adminClient.identityProviders.delMapper({ alias, id });
}

export async function importFromUrl(
    params: { providerId: string; fromUrl: string }
) {
    return adminClient.identityProviders.importFromUrl(params);
}

export async function reloadKeys(alias: string) {
    return adminClient.identityProviders.reloadKeys({ alias });
}

export async function uploadCertificate(formData: FormData) {
    return adminClient.identityProviders.uploadCertificate({}, formData);
}

export async function importFromUrlFormData(formData: FormData) {
    return adminClient.identityProviders.importFromUrl(formData);
}

export async function searchIdentityProviders(
    params: IdentityProvidersQuery
) {
    return adminClient.identityProviders.find(params);
}

export function getAdminClientBaseUrl() {
    return adminClient.baseUrl;
}

export async function getAdminClientAccessToken() {
    return adminClient.getAccessToken();
}
