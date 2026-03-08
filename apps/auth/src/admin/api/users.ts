import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

// ── List / find ─────────────────────────────────────────────────────────

export async function findUsers(adminClient: KeycloakAdminClient) {
    return adminClient.users.find({ first: 0, max: 1000 });
}

export async function findUser(
    adminClient: KeycloakAdminClient,
    id: string,
    userProfileMetadata = false
) {
    return adminClient.users.findOne({ id, userProfileMetadata });
}

// ── Mutations ───────────────────────────────────────────────────────────

export async function updateUser(
    adminClient: KeycloakAdminClient,
    id: string,
    user: UserRepresentation
) {
    return adminClient.users.update({ id }, user);
}

export async function deleteUser(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.users.del({ id });
}

// ── User detail helpers ─────────────────────────────────────────────────

export async function fetchAttackDetection(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.attackDetection.findOne({ id });
}

export async function fetchUserUnmanagedAttributes(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.users.getUnmanagedAttributes({ id });
}

export async function fetchUserProfile(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.users.getProfile({ realm });
}

export async function fetchUserProfileMetadata(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    return adminClient.users.getProfileMetadata({ realm });
}

// ── Organizations ───────────────────────────────────────────────────────

export async function fetchOrganizations(
    adminClient: KeycloakAdminClient,
    first = 0,
    max = 1
) {
    return adminClient.organizations.find({ first, max });
}

export async function fetchMemberOrganizations(
    adminClient: KeycloakAdminClient,
    userId: string
) {
    return adminClient.organizations.memberOrganizations({ userId });
}

export async function fetchOrganizationMembers(
    adminClient: KeycloakAdminClient,
    orgId: string
) {
    return adminClient.organizations.listMembers({ orgId });
}

// ── Sessions ────────────────────────────────────────────────────────────

export async function fetchUserSessions(
    adminClient: KeycloakAdminClient,
    id: string,
    realm: string
) {
    return adminClient.users.listSessions({ id, realm });
}

// ── Groups ──────────────────────────────────────────────────────────────

export async function fetchUserGroups(
    adminClient: KeycloakAdminClient,
    id: string,
    first = 0,
    max = 500
) {
    return adminClient.users.listGroups({ id, first, max });
}

export async function addUserToGroup(
    adminClient: KeycloakAdminClient,
    id: string,
    groupId: string
) {
    return adminClient.users.addToGroup({ id, groupId });
}

export async function removeUserFromGroup(
    adminClient: KeycloakAdminClient,
    id: string,
    groupId: string
) {
    return adminClient.users.delFromGroup({ id, groupId });
}

// ── Consents ────────────────────────────────────────────────────────────

export async function fetchUserConsents(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.users.listConsents({ id });
}

export async function revokeUserConsent(
    adminClient: KeycloakAdminClient,
    id: string,
    clientId: string
) {
    return adminClient.users.revokeConsent({ id, clientId });
}

// ── Credentials ─────────────────────────────────────────────────────────

export async function fetchUserCredentials(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.users.getCredentials({ id });
}

export async function deleteUserCredential(
    adminClient: KeycloakAdminClient,
    id: string,
    credentialId: string
) {
    return adminClient.users.deleteCredential({ id, credentialId });
}

// ── Federated identities ────────────────────────────────────────────────

export async function fetchFederatedIdentities(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.users.listFederatedIdentities({ id });
}

export async function fetchLinkedIdPs(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.identityProviders.find();
}

export async function fetchAvailableIdPs(adminClient: KeycloakAdminClient) {
    return adminClient.identityProviders.find({
        first: 0,
        max: 500,
        realmOnly: false,
        capability: "USER_LINKING"
    });
}

export async function unlinkFederatedIdentity(
    adminClient: KeycloakAdminClient,
    id: string,
    federatedIdentityId: string
) {
    return adminClient.users.delFromFederatedIdentity({ id, federatedIdentityId });
}

// ── Federation component ────────────────────────────────────────────────

export async function fetchFederationComponent(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.components.findOne({ id });
}

export async function fetchStorageProviderName(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.userStorageProvider.name({ id });
}

// ── Required actions ────────────────────────────────────────────────────

export async function fetchRequiredActions(adminClient: KeycloakAdminClient) {
    return adminClient.authenticationManagement.getRequiredActions();
}
