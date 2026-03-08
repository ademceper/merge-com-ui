import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";

export async function findRealmRoles(adminClient: KeycloakAdminClient) {
    return adminClient.roles.find({ first: 0, max: 10000 });
}

export async function findRealmRole(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.roles.findOneById({ id });
}

export async function updateRealmRole(
    adminClient: KeycloakAdminClient,
    id: string,
    role: RoleRepresentation
) {
    return adminClient.roles.updateById({ id }, role);
}

export async function deleteRealmRole(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.roles.delById({ id });
}

export async function updateClientRole(
    adminClient: KeycloakAdminClient,
    clientId: string,
    roleName: string,
    role: RoleRepresentation
) {
    return adminClient.clients.updateRole({ id: clientId, roleName }, role);
}

export async function deleteClientRole(
    adminClient: KeycloakAdminClient,
    clientId: string,
    roleName: string
) {
    return adminClient.clients.delRole({ id: clientId, roleName });
}

export async function addCompositeRoles(
    adminClient: KeycloakAdminClient,
    roleId: string,
    realm: string,
    composites: RoleRepresentation[]
) {
    return adminClient.roles.createComposite({ roleId, realm }, composites);
}

export async function findClientDetail(adminClient: KeycloakAdminClient, clientId: string) {
    return adminClient.clients.findOne({ id: clientId });
}
