import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { adminClient } from "../app/admin-client";

export async function findRealmRoles() {
    return adminClient.roles.find({ first: 0, max: 10000 });
}

export async function findRealmRole(id: string) {
    return adminClient.roles.findOneById({ id });
}

export async function updateRealmRole(
    id: string,
    role: RoleRepresentation
) {
    return adminClient.roles.updateById({ id }, role);
}

export async function deleteRealmRole(id: string) {
    return adminClient.roles.delById({ id });
}

export async function updateClientRole(
    clientId: string,
    roleName: string,
    role: RoleRepresentation
) {
    return adminClient.clients.updateRole({ id: clientId, roleName }, role);
}

export async function deleteClientRole(
    clientId: string,
    roleName: string
) {
    return adminClient.clients.delRole({ id: clientId, roleName });
}

export async function addCompositeRoles(
    roleId: string,
    realm: string,
    composites: RoleRepresentation[]
) {
    return adminClient.roles.createComposite({ roleId, realm }, composites);
}

export async function createRealmRole(role: RoleRepresentation) {
    return adminClient.roles.create(role);
}

export async function findRealmRoleByName(name: string) {
    return adminClient.roles.findOneByName({ name });
}

export async function findUsersWithRealmRole(
    roleName: string,
    options?: { first?: number; max?: number; briefRepresentation?: boolean }
) {
    return adminClient.roles.findUsersWithRole({
        name: roleName,
        briefRepresentation: options?.briefRepresentation ?? true,
        first: options?.first ?? 0,
        max: options?.max ?? 500
    });
}

export async function findUsersWithClientRole(
    clientId: string,
    roleName: string,
    options?: { first?: number; max?: number; briefRepresentation?: boolean }
) {
    return adminClient.clients.findUsersWithRole({
        id: clientId,
        roleName,
        briefRepresentation: options?.briefRepresentation ?? true,
        first: options?.first ?? 0,
        max: options?.max ?? 500
    });
}

export async function removeCompositeRoles(
    parentRoleId: string,
    roles: RoleRepresentation[]
) {
    return adminClient.roles.delCompositeRoles({ id: parentRoleId }, roles);
}

export async function findClientDetail(
    clientId: string
) {
    return adminClient.clients.findOne({ id: clientId });
}
