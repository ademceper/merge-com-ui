import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { sortBy } from "lodash-es";

// --- Query functions ---

export async function findOrganizations(adminClient: KeycloakAdminClient) {
    return adminClient.organizations.find({ first: 0, max: 1000 });
}

export async function findOrganization(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.organizations.findOne({ id });
}

export async function fetchOrganizationMembers(
    adminClient: KeycloakAdminClient,
    orgId: string,
    filters?: { search?: string; membershipType?: string }
) {
    return adminClient.organizations.listMembers({
        orgId,
        first: 0,
        max: 500,
        search: filters?.search,
        membershipType: filters?.membershipType
    });
}

export async function fetchOrganizationInvitations(
    adminClient: KeycloakAdminClient,
    orgId: string,
    filters?: { search?: string; status?: string }
) {
    return adminClient.organizations.listInvitations({
        orgId,
        first: 0,
        max: 500,
        search: filters?.search,
        status: filters?.status
    });
}

export async function fetchOrganizationIdentityProviders(
    adminClient: KeycloakAdminClient,
    orgId: string
) {
    return sortBy(
        await adminClient.organizations.listIdentityProviders({ orgId }),
        "alias"
    );
}

export async function hasIdentityProviders(
    adminClient: KeycloakAdminClient
) {
    const providers = await adminClient.identityProviders.find({ max: 1 });
    return providers.length === 1;
}

// --- Mutation functions ---

export async function createOrganization(
    adminClient: KeycloakAdminClient,
    org: OrganizationRepresentation
) {
    return adminClient.organizations.create(org);
}

export async function updateOrganization(
    adminClient: KeycloakAdminClient,
    id: string,
    org: OrganizationRepresentation
) {
    return adminClient.organizations.updateById({ id }, org);
}

export async function deleteOrganization(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.organizations.delById({ id });
}

export async function addOrganizationMember(
    adminClient: KeycloakAdminClient,
    orgId: string,
    userIds: string[]
) {
    return Promise.all(
        userIds.map(userId =>
            adminClient.organizations.addMember({
                orgId,
                userId: `"${userId}"`
            })
        )
    );
}

export async function removeOrganizationMember(
    adminClient: KeycloakAdminClient,
    orgId: string,
    userIds: string[]
) {
    return Promise.all(
        userIds.map(userId =>
            adminClient.organizations.delMember({ orgId, userId })
        )
    );
}

export async function resendInvitation(
    adminClient: KeycloakAdminClient,
    orgId: string,
    invitationId: string
) {
    return adminClient.organizations.resendInvitation({ orgId, invitationId });
}

export async function deleteInvitation(
    adminClient: KeycloakAdminClient,
    orgId: string,
    invitationIds: string[]
) {
    return Promise.all(
        invitationIds.map(invitationId =>
            adminClient.organizations.deleteInvitation({
                orgId,
                invitationId
            })
        )
    );
}

export async function unlinkOrganizationIdp(
    adminClient: KeycloakAdminClient,
    orgId: string,
    alias: string
) {
    return adminClient.organizations.unLinkIdp({ orgId, alias });
}

export async function updateIdentityProviderForOrg(
    adminClient: KeycloakAdminClient,
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.update(
        { alias: provider.alias! },
        provider
    );
}
