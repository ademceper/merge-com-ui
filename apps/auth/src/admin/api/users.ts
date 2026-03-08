import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { adminClient } from "../app/admin-client";

// ── List / find ─────────────────────────────────────────────────────────

export async function findUsers() {
    return adminClient.users.find({ first: 0, max: 1000 });
}

export async function findUser(
    id: string,
    userProfileMetadata = false
) {
    return adminClient.users.findOne({ id, userProfileMetadata });
}

// ── Mutations ───────────────────────────────────────────────────────────

export async function updateUser(
    id: string,
    user: UserRepresentation
) {
    return adminClient.users.update({ id }, user);
}

export async function createUser(user: UserRepresentation) {
    return adminClient.users.create(user);
}

export async function deleteUser(id: string) {
    return adminClient.users.del({ id });
}

export async function logoutUser(id: string) {
    return adminClient.users.logout({ id });
}

export async function impersonateUser(
    id: string,
    realm: string
) {
    return adminClient.users.impersonation({ id }, { user: id, realm });
}

// ── User detail helpers ─────────────────────────────────────────────────

export async function fetchAttackDetection(id: string) {
    return adminClient.attackDetection.findOne({ id });
}

export async function fetchUserUnmanagedAttributes(
    id: string
) {
    return adminClient.users.getUnmanagedAttributes({ id });
}

export async function fetchUserProfile(realm: string) {
    return adminClient.users.getProfile({ realm });
}

export async function fetchUserProfileMetadata(
    realm: string
) {
    return adminClient.users.getProfileMetadata({ realm });
}

// ── Organizations ───────────────────────────────────────────────────────

export async function fetchOrganizations(
    first = 0,
    max = 1
) {
    return adminClient.organizations.find({ first, max });
}

export async function fetchMemberOrganizations(
    userId: string
) {
    return adminClient.organizations.memberOrganizations({ userId });
}

export async function fetchOrganizationMembers(
    orgId: string
) {
    return adminClient.organizations.listMembers({ orgId });
}

// ── Sessions ────────────────────────────────────────────────────────────

export async function fetchUserSessions(
    id: string,
    realm: string
) {
    return adminClient.users.listSessions({ id, realm });
}

// ── Groups ──────────────────────────────────────────────────────────────

export async function fetchUserGroups(
    id: string,
    first = 0,
    max = 500
) {
    return adminClient.users.listGroups({ id, first, max });
}

export async function addUserToGroup(
    id: string,
    groupId: string
) {
    return adminClient.users.addToGroup({ id, groupId });
}

export async function removeUserFromGroup(
    id: string,
    groupId: string
) {
    return adminClient.users.delFromGroup({ id, groupId });
}

// ── Consents ────────────────────────────────────────────────────────────

export async function fetchUserConsents(id: string) {
    return adminClient.users.listConsents({ id });
}

export async function revokeUserConsent(
    id: string,
    clientId: string
) {
    return adminClient.users.revokeConsent({ id, clientId });
}

// ── Credentials ─────────────────────────────────────────────────────────

export async function fetchUserCredentials(id: string) {
    return adminClient.users.getCredentials({ id });
}

export async function deleteUserCredential(
    id: string,
    credentialId: string
) {
    return adminClient.users.deleteCredential({ id, credentialId });
}

export async function resetUserPassword(
    id: string,
    credential: CredentialRepresentation
) {
    return adminClient.users.resetPassword({ id, credential });
}

export async function updateCredentialLabel(
    id: string,
    credentialId: string,
    label: string
) {
    return adminClient.users.updateCredentialLabel({ id, credentialId }, label);
}

export async function moveCredentialPositionDown(
    id: string,
    credentialId: string,
    newPreviousCredentialId: string
) {
    return adminClient.users.moveCredentialPositionDown({
        id,
        credentialId,
        newPreviousCredentialId
    });
}

export async function moveCredentialPositionUp(
    id: string,
    credentialId: string
) {
    return adminClient.users.moveCredentialPositionUp({ id, credentialId });
}

export async function executeActionsEmail(
    id: string,
    actions: string[],
    lifespan?: number
) {
    return adminClient.users.executeActionsEmail({ id, actions, lifespan });
}

// ── Federated identities ────────────────────────────────────────────────

export async function fetchFederatedIdentities(
    id: string
) {
    return adminClient.users.listFederatedIdentities({ id });
}

export async function fetchLinkedIdPs(id: string) {
    return adminClient.identityProviders.find();
}

export async function fetchAvailableIdPs() {
    return adminClient.identityProviders.find({
        first: 0,
        max: 500,
        realmOnly: false,
        capability: "USER_LINKING"
    });
}

export async function unlinkFederatedIdentity(
    id: string,
    federatedIdentityId: string
) {
    return adminClient.users.delFromFederatedIdentity({ id, federatedIdentityId });
}

export async function addToFederatedIdentity(
    id: string,
    federatedIdentityId: string,
    federatedIdentity: FederatedIdentityRepresentation
) {
    return adminClient.users.addToFederatedIdentity({
        id,
        federatedIdentityId,
        federatedIdentity
    });
}

// ── Role mappings ──────────────────────────────────────────────────────

export async function addRealmRoleMappings(
    id: string,
    roles: { id: string; name: string }[]
) {
    return adminClient.users.addRealmRoleMappings({ id, roles });
}

export async function addClientRoleMappings(
    id: string,
    clientUniqueId: string,
    roles: { id: string; name: string }[]
) {
    return adminClient.users.addClientRoleMappings({ id, clientUniqueId, roles });
}

// ── Organizations (user-facing) ────────────────────────────────────────

export async function removeOrgMember(orgId: string, userId: string) {
    return adminClient.organizations.delMember({ orgId, userId });
}

export async function addOrgMember(orgId: string, userId: string) {
    return adminClient.organizations.addMember({ orgId, userId });
}

export async function inviteExistingUser(orgId: string, formData: FormData) {
    return adminClient.organizations.inviteExistingUser({ orgId }, formData);
}

// ── Federation component ────────────────────────────────────────────────

export async function fetchFederationComponent(
    id: string
) {
    return adminClient.components.findOne({ id });
}

export async function fetchStorageProviderName(
    id: string
) {
    return adminClient.userStorageProvider.name({ id });
}

// ── Required actions ────────────────────────────────────────────────────

export async function fetchRequiredActions() {
    return adminClient.authenticationManagement.getRequiredActions();
}
