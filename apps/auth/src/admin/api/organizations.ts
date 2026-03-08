import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { sortBy } from "lodash-es";
import { adminClient } from "../app/admin-client";

// --- Query functions ---

export async function findOrganizations() {
    return adminClient.organizations.find({ first: 0, max: 1000 });
}

export async function findOrganization(id: string) {
    return adminClient.organizations.findOne({ id });
}

export async function fetchOrganizationMembers(
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
    orgId: string
) {
    return sortBy(
        await adminClient.organizations.listIdentityProviders({ orgId }),
        "alias"
    );
}

export async function hasIdentityProviders() {
    const providers = await adminClient.identityProviders.find({ max: 1 });
    return providers.length === 1;
}

// --- Mutation functions ---

export async function createOrganization(
    org: OrganizationRepresentation
) {
    return adminClient.organizations.create(org);
}

export async function updateOrganization(
    id: string,
    org: OrganizationRepresentation
) {
    return adminClient.organizations.updateById({ id }, org);
}

export async function deleteOrganization(id: string) {
    return adminClient.organizations.delById({ id });
}

export async function addOrganizationMember(
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
    orgId: string,
    userIds: string[]
) {
    return Promise.all(
        userIds.map(userId => adminClient.organizations.delMember({ orgId, userId }))
    );
}

export async function resendInvitation(
    orgId: string,
    invitationId: string
) {
    return adminClient.organizations.resendInvitation({ orgId, invitationId });
}

export async function deleteInvitation(
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
    orgId: string,
    alias: string
) {
    return adminClient.organizations.unLinkIdp({ orgId, alias });
}

export async function updateIdentityProviderForOrg(
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.update({ alias: provider.alias! }, provider);
}

export async function inviteOrganizationMember(
    orgId: string,
    formData: FormData
) {
    return adminClient.organizations.invite({ orgId }, formData);
}

export async function linkOrganizationIdp(
    orgId: string,
    alias: string
) {
    return adminClient.organizations.linkIdp({ orgId, alias });
}

export async function findIdentityProviderByAlias(alias: string) {
    return adminClient.identityProviders.findOne({ alias });
}

export async function updateIdentityProviderByAlias(
    alias: string,
    provider: IdentityProviderRepresentation
) {
    return adminClient.identityProviders.update({ alias }, provider);
}
