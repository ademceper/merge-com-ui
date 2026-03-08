import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type ResourceEvaluation from "@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation";
import type { PolicyQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { sortBy } from "lodash-es";

export async function findAdminPermissionsClient(adminClient: KeycloakAdminClient) {
    const clients = await adminClient.clients.find({
        clientId: "admin-permissions"
    });
    return clients[0] as ClientRepresentation;
}

export async function findPermissionsList(
    adminClient: KeycloakAdminClient,
    clientId: string,
    search: Record<string, unknown>,
    first: number,
    max: number
) {
    const permissions = await adminClient.clients.listPermissionScope({
        first,
        max: max + 1,
        id: clientId,
        ...search
    });

    const processedPermissions = await Promise.all(
        (permissions || []).map(async permission => {
            const [policies, scopes, resources] = await Promise.all([
                adminClient.clients.getAssociatedPolicies({
                    id: clientId,
                    permissionId: permission.id!
                }),
                adminClient.clients.getAssociatedScopes({
                    id: clientId,
                    permissionId: permission.id!
                }),
                adminClient.clients.getAssociatedResources({
                    id: clientId,
                    permissionId: permission.id!
                })
            ]);

            return {
                ...permission,
                policies,
                scopes,
                resources,
                isExpanded: false
            };
        })
    );

    return processedPermissions;
}

export async function findPermissionDetail(
    adminClient: KeycloakAdminClient,
    clientId: string,
    permissionId: string
) {
    const [permission, resources, policies, scopes] = await Promise.all([
        adminClient.clients.findOnePermission({
            id: clientId,
            type: "scope",
            permissionId
        }),
        adminClient.clients.getAssociatedResources({
            id: clientId,
            permissionId
        }),
        adminClient.clients.getAssociatedPolicies({
            id: clientId,
            permissionId
        }),
        adminClient.clients.getAssociatedScopes({
            id: clientId,
            permissionId
        })
    ]);

    if (!permission) {
        throw new Error("notFound");
    }

    return { permission, resources, policies, scopes };
}

export async function findProvidersAndPolicies(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    const [providers, policies] = await Promise.all([
        adminClient.clients.listPolicyProviders({ id: clientId }),
        adminClient.clients.listPolicies({
            id: clientId,
            permission: "false"
        })
    ]);

    const filteredProviders = providers?.filter(
        p => p.type !== "resource" && p.type !== "scope"
    );

    return {
        providers: sortBy(filteredProviders, "type"),
        policies: policies || []
    };
}

export async function findPolicyProviders(
    adminClient: KeycloakAdminClient,
    clientId: string
) {
    const providers = await adminClient.clients.listPolicyProviders({
        id: clientId
    });
    const formattedProviders = providers
        .filter(p => p.type !== "resource" && p.type !== "scope")
        .map(provider => provider.name)
        .filter(name => name !== undefined);
    return sortBy(formattedProviders) as string[];
}

export async function findPoliciesList(
    adminClient: KeycloakAdminClient,
    clientId: string,
    filterType?: string
) {
    const params: PolicyQuery = {
        id: clientId,
        permission: "false",
        first: 0,
        max: 500
    };
    if (filterType) params.type = filterType;
    return (await adminClient.clients.listPolicies(params)) || [];
}

export async function findPolicyDetailsByType(
    adminClient: KeycloakAdminClient,
    clientId: string,
    values: { id: string; type?: string }[]
) {
    if (!values || values.length === 0) return [] as PolicyRepresentation[];
    const results = await Promise.all(
        values.map(p =>
            adminClient.clients.findOnePolicyWithType({
                id: clientId,
                type: p.type!,
                policyId: p.id
            }) as Promise<PolicyRepresentation | undefined>
        )
    );
    return results.filter((p): p is PolicyRepresentation => !!p);
}

export async function findGroupDetails(adminClient: KeycloakAdminClient, ids: string[]) {
    if (ids.length === 0) return [];
    const groups = await Promise.all(ids.map(id => adminClient.groups.findOne({ id })));
    return groups
        .flat()
        .filter(
            g => g
        ) as import("@keycloak/keycloak-admin-client/lib/defs/groupRepresentation").default[];
}

export async function findRoleDetails(adminClient: KeycloakAdminClient, ids: string[]) {
    if (ids.length === 0) return [];
    const roles = await Promise.all(
        ids.map(id => adminClient.roles.findOneById({ id }))
    );
    return Promise.all(
        roles.map(async role => ({
            role: role!,
            client: role!.clientRole
                ? await adminClient.clients.findOne({
                      id: role?.containerId!
                  })
                : undefined
        }))
    );
}

export async function deletePermission(
    adminClient: KeycloakAdminClient,
    clientId: string,
    type: string,
    permissionId: string
) {
    return adminClient.clients.delPermission({
        id: clientId,
        type,
        permissionId
    });
}

export async function savePermission(
    adminClient: KeycloakAdminClient,
    clientId: string,
    permission: PolicyRepresentation,
    permissionId?: string
) {
    if (permissionId) {
        await adminClient.clients.updatePermission(
            { id: clientId, type: "scope", permissionId },
            permission
        );
        return permission;
    }
    return adminClient.clients.createPermission(
        { id: clientId, type: "scope" },
        permission
    );
}

export async function createPolicy(
    adminClient: KeycloakAdminClient,
    clientId: string,
    type: string,
    policy: PolicyRepresentation
) {
    return adminClient.clients.createPolicy({ id: clientId, type }, policy);
}

export async function updateAdminPermissionsClient(
    adminClient: KeycloakAdminClient,
    client: ClientRepresentation,
    updates: ClientRepresentation
) {
    const newClient: ClientRepresentation = {
        ...client,
        ...updates
    };
    newClient.clientId = newClient.clientId?.trim();
    await adminClient.clients.update({ id: client.clientId! }, newClient);
    return newClient;
}

export async function evaluateResource(
    adminClient: KeycloakAdminClient,
    clientId: string,
    realm: string,
    resEval: ResourceEvaluation
) {
    return adminClient.clients.evaluateResource({ id: clientId, realm }, resEval);
}
