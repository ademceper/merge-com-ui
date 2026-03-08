import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";

// ── Evaluate page ──

export async function findRoles(adminClient: KeycloakAdminClient) {
    return adminClient.roles.find();
}

export async function listResourcesAndScopes(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return Promise.all([
        adminClient.clients.listResources({ id: clientId }),
        adminClient.clients.listAllScopes({ id: clientId })
    ]);
}

// ── Export ──

export async function exportResource(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.exportResource({ id: clientId });
}

// ── Detail cell ──

export async function findScopesByResource(
    adminClient: KeycloakAdminClient,
    clientId: string,
    resourceName: string
) {
    return adminClient.clients.listScopesByResource({
        id: clientId,
        resourceName
    });
}

export async function findPermissionsByResource(
    adminClient: KeycloakAdminClient,
    clientId: string,
    resourceId: string
) {
    return adminClient.clients.listPermissionsByResource({
        id: clientId,
        resourceId
    });
}

// ── Permission details ──

export async function findOnePermission(
    adminClient: KeycloakAdminClient,
    clientId: string,
    type: string,
    permissionId: string
) {
    return adminClient.clients.findOnePermission({
        id: clientId,
        type,
        permissionId
    });
}

export async function getAssociatedResources(
    adminClient: KeycloakAdminClient,
    clientId: string,
    permissionId: string
) {
    return adminClient.clients.getAssociatedResources({
        id: clientId,
        permissionId
    });
}

export async function getAssociatedPolicies(
    adminClient: KeycloakAdminClient,
    clientId: string,
    permissionId: string
) {
    return adminClient.clients.getAssociatedPolicies({
        id: clientId,
        permissionId
    });
}

export async function getAssociatedScopes(
    adminClient: KeycloakAdminClient,
    clientId: string,
    permissionId: string
) {
    return adminClient.clients.getAssociatedScopes({
        id: clientId,
        permissionId
    });
}

// ── Permissions list ──

export async function findPermissions(
    adminClient: KeycloakAdminClient,
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    return adminClient.clients.findPermissions({
        first,
        max,
        id: clientId,
        ...search
    });
}

export async function listPolicyProviders(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.listPolicyProviders({ id: clientId });
}

export async function listResources(
    adminClient: KeycloakAdminClient,
    clientId: string,
    params?: Record<string, unknown>
) {
    return adminClient.clients.listResources({ ...params, id: clientId });
}

export async function listAllScopes(
    adminClient: KeycloakAdminClient,
    clientId: string,
    params?: Record<string, unknown>
) {
    return adminClient.clients.listAllScopes({ ...params, id: clientId });
}

// ── Delete mutations ──

export async function deletePermission(
    adminClient: KeycloakAdminClient,
    clientId: string,
    type: string,
    permissionId: string
) {
    return adminClient.clients.delPermission({ id: clientId, type, permissionId });
}

export async function deletePolicy(
    adminClient: KeycloakAdminClient,
    clientId: string,
    policyId: string
) {
    return adminClient.clients.delPolicy({ id: clientId, policyId });
}

export async function deleteResource(
    adminClient: KeycloakAdminClient,
    clientId: string,
    resourceId: string
) {
    return adminClient.clients.delResource({ id: clientId, resourceId });
}

// ── Policies list ──

export async function findPolicies(
    adminClient: KeycloakAdminClient,
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    return adminClient.clients.listPolicies({
        first,
        max,
        id: clientId,
        permission: "false",
        ...search
    });
}

export async function listDependentPolicies(
    adminClient: KeycloakAdminClient,
    clientId: string,
    policyId: string
) {
    return adminClient.clients.listDependentPolicies({
        id: clientId,
        policyId
    });
}

// ── Scope permissions ──

export async function listAllResourcesByScope(
    adminClient: KeycloakAdminClient,
    clientId: string,
    scopeId: string
) {
    return adminClient.clients.listAllResourcesByScope({
        id: clientId,
        scopeId
    });
}

export async function listAllPermissionsByScope(
    adminClient: KeycloakAdminClient,
    clientId: string,
    scopeId: string
) {
    return adminClient.clients.listAllPermissionsByScope({
        id: clientId,
        scopeId
    });
}

// ── Scope details ──

export async function getAuthorizationScope(
    adminClient: KeycloakAdminClient,
    clientId: string,
    scopeId: string
) {
    return adminClient.clients.getAuthorizationScope({
        id: clientId,
        scopeId
    });
}

// ── Resource details ──

export async function getResource(
    adminClient: KeycloakAdminClient,
    clientId: string,
    resourceId: string
) {
    return adminClient.clients.getResource({ id: clientId, resourceId });
}

// ── Resource server ──

export async function getResourceServer(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    return adminClient.clients.getResourceServer({ id: clientId });
}

// ── Policy details ──

export async function findOnePolicyWithType(
    adminClient: KeycloakAdminClient,
    clientId: string,
    type: string,
    policyId: string
) {
    return adminClient.clients.findOnePolicyWithType({
        id: clientId,
        type,
        policyId
    });
}

// ── Policy sub-components ──

export async function findClientScopes(adminClient: KeycloakAdminClient) {
    return adminClient.clientScopes.find();
}

export async function findGroupById(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.groups.findOne({ id });
}

export async function findRoleById(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.roles.findOneById({ id });
}

export async function findClientById(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.clients.findOne({ id });
}

export async function findOnePolicy(
    adminClient: KeycloakAdminClient,
    clientId: string,
    policyId: string
) {
    return adminClient.clients.findOnePolicy({
        id: clientId,
        policyId
    });
}

// ── Resources/Policy select ──

export async function searchResourcesOrPolicies(
    adminClient: KeycloakAdminClient,
    clientId: string,
    searchFunction: "listResources" | "listPolicies",
    params: PolicyQuery
) {
    return adminClient.clients[searchFunction](params);
}

export async function fetchAssociatedItems(
    adminClient: KeycloakAdminClient,
    clientId: string,
    fetchFunction: "getAssociatedResources" | "getAssociatedPolicies",
    permissionId: string
) {
    return adminClient.clients[fetchFunction]({
        id: clientId,
        permissionId
    });
}
