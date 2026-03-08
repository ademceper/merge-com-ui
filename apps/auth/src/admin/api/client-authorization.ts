import type { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { adminClient } from "../app/admin-client";

// ── Evaluate page ──

export async function findRoles() {
    return adminClient.roles.find();
}

export async function listResourcesAndScopes(
    clientId: string
) {
    return Promise.all([
        adminClient.clients.listResources({ id: clientId }),
        adminClient.clients.listAllScopes({ id: clientId })
    ]);
}

// ── Export ──

export async function exportResource(clientId: string) {
    return adminClient.clients.exportResource({ id: clientId });
}

// ── Detail cell ──

export async function findScopesByResource(
    clientId: string,
    resourceName: string
) {
    return adminClient.clients.listScopesByResource({
        id: clientId,
        resourceName
    });
}

export async function findPermissionsByResource(
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
    clientId: string,
    permissionId: string
) {
    return adminClient.clients.getAssociatedResources({
        id: clientId,
        permissionId
    });
}

export async function getAssociatedPolicies(
    clientId: string,
    permissionId: string
) {
    return adminClient.clients.getAssociatedPolicies({
        id: clientId,
        permissionId
    });
}

export async function getAssociatedScopes(
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
    clientId: string
) {
    return adminClient.clients.listPolicyProviders({ id: clientId });
}

export async function listResources(
    clientId: string,
    params?: Record<string, unknown>
) {
    return adminClient.clients.listResources({ ...params, id: clientId });
}

export async function listAllScopes(
    clientId: string,
    params?: Record<string, unknown>
) {
    return adminClient.clients.listAllScopes({ ...params, id: clientId });
}

// ── Delete mutations ──

export async function deletePermission(
    clientId: string,
    type: string,
    permissionId: string
) {
    return adminClient.clients.delPermission({ id: clientId, type, permissionId });
}

export async function deletePolicy(
    clientId: string,
    policyId: string
) {
    return adminClient.clients.delPolicy({ id: clientId, policyId });
}

export async function deleteResource(
    clientId: string,
    resourceId: string
) {
    return adminClient.clients.delResource({ id: clientId, resourceId });
}

// ── Policies list ──

export async function findPolicies(
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
    clientId: string,
    scopeId: string
) {
    return adminClient.clients.listAllResourcesByScope({
        id: clientId,
        scopeId
    });
}

export async function listAllPermissionsByScope(
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
    clientId: string,
    resourceId: string
) {
    return adminClient.clients.getResource({ id: clientId, resourceId });
}

// ── Resource server ──

export async function getResourceServer(
    clientId: string
) {
    return adminClient.clients.getResourceServer({ id: clientId });
}

// ── Policy details ──

export async function findOnePolicyWithType(
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

export async function findClientScopes() {
    return adminClient.clientScopes.find();
}

export async function findGroupById(id: string) {
    return adminClient.groups.findOne({ id });
}

export async function findRoleById(id: string) {
    return adminClient.roles.findOneById({ id });
}

export async function findClientById(id: string) {
    return adminClient.clients.findOne({ id });
}

export async function findOnePolicy(
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
    clientId: string,
    searchFunction: "listResources" | "listPolicies",
    params: PolicyQuery
) {
    return adminClient.clients[searchFunction](params);
}

export async function fetchAssociatedItems(
    clientId: string,
    fetchFunction: "getAssociatedResources" | "getAssociatedPolicies",
    permissionId: string
) {
    return adminClient.clients[fetchFunction]({
        id: clientId,
        permissionId
    });
}

// ── Authorization settings ──

export async function importResource(
    clientId: string,
    value: Record<string, unknown>
) {
    return adminClient.clients.importResource({ id: clientId }, value);
}

export async function updateResourceServer(
    clientId: string,
    resource: Record<string, unknown>
) {
    return adminClient.clients.updateResourceServer({ id: clientId }, resource);
}

// ── Authorization evaluate ──

export async function evaluateResource(
    clientId: string,
    realm: string,
    evaluation: Record<string, unknown>
) {
    return adminClient.clients.evaluateResource(
        { id: clientId, realm },
        evaluation
    );
}

// ── Resource CRUD ──

export async function createResource(
    clientId: string,
    resource: Record<string, unknown>
) {
    return adminClient.clients.createResource({ id: clientId }, resource);
}

export async function updateResource(
    clientId: string,
    resourceId: string,
    resource: Record<string, unknown>
) {
    return adminClient.clients.updateResource(
        { id: clientId, resourceId },
        resource
    );
}

// ── Scope CRUD ──

export async function createAuthorizationScope(
    clientId: string,
    scope: Record<string, unknown>
) {
    return adminClient.clients.createAuthorizationScope(
        { id: clientId },
        scope
    );
}

export async function updateAuthorizationScope(
    clientId: string,
    scopeId: string,
    scope: Record<string, unknown>
) {
    return adminClient.clients.updateAuthorizationScope(
        { id: clientId, scopeId },
        scope
    );
}

export async function delAuthorizationScope(
    clientId: string,
    scopeId: string
) {
    return adminClient.clients.delAuthorizationScope({
        id: clientId,
        scopeId
    });
}

// ── Permission CRUD ──

export async function createPermission(
    clientId: string,
    type: string,
    permission: Record<string, unknown>
) {
    return adminClient.clients.createPermission(
        { id: clientId, type },
        permission
    );
}

export async function updatePermission(
    clientId: string,
    type: string,
    permissionId: string,
    permission: Record<string, unknown>
) {
    return adminClient.clients.updatePermission(
        { id: clientId, type, permissionId },
        permission
    );
}

// ── Policy CRUD ──

export async function createPolicy(
    clientId: string,
    type: string,
    policy: Record<string, unknown>
) {
    return adminClient.clients.createPolicy(
        { id: clientId, type },
        policy
    );
}

export async function updatePolicy(
    clientId: string,
    type: string,
    policyId: string,
    policy: Record<string, unknown>
) {
    return adminClient.clients.updatePolicy(
        { id: clientId, type, policyId },
        policy
    );
}
