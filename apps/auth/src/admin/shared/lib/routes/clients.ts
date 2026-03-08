import { generateEncodedPath, type PathParams } from "../generate-encoded-path";

// Clients list
export type ClientsTab = "list" | "initial-access-token" | "client-registration";

export type ClientsParams = {
    realm: string;
    tab?: ClientsTab;
};

export const CLIENTS_PATH = "/:realm/clients";
export const CLIENTS_PATH_WITH_TAB = "/:realm/clients/:tab";

export const toClients = (params: ClientsParams): string => {
    const path = params.tab ? CLIENTS_PATH_WITH_TAB : CLIENTS_PATH;
    const pathParams = (
        params.tab ? { realm: params.realm, tab: params.tab } : { realm: params.realm }
    ) as PathParams<typeof path>;
    return generateEncodedPath(path, pathParams);
};

// Client detail
export type ClientTab =
    | "settings"
    | "keys"
    | "credentials"
    | "roles"
    | "clientScopes"
    | "advanced"
    | "mappers"
    | "authorization"
    | "serviceAccount"
    | "permissions"
    | "sessions"
    | "events";

export type ClientParams = {
    realm: string;
    clientId: string;
    tab: ClientTab;
};

export const toClient = (params: ClientParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/:tab", params);

// Authorization tab
type AuthorizationTab =
    | "settings"
    | "resources"
    | "scopes"
    | "policies"
    | "permissions"
    | "evaluate"
    | "export";

type AuthorizationParams = {
    realm: string;
    clientId: string;
    tab: AuthorizationTab;
};

export const toAuthorizationTab = (params: AuthorizationParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/authorization/:tab", params);

// Client role
export type ClientRoleTab =
    | "details"
    | "attributes"
    | "users-in-role"
    | "associated-roles";

export type ClientRoleParams = {
    realm: string;
    clientId: string;
    id: string;
    tab: ClientRoleTab;
};

export const toClientRole = (params: ClientRoleParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/roles/:id/:tab", params);

// Dedicated scope details
export type DedicatedScopeTab = "mappers" | "scope";

export type DedicatedScopeDetailsParams = {
    realm: string;
    clientId: string;
    tab?: DedicatedScopeTab;
};

export const toDedicatedScope = (params: DedicatedScopeDetailsParams): string => {
    if (params.tab) {
        return generateEncodedPath(
            "/:realm/clients/:clientId/clientScopes/dedicated/:tab",
            {
                realm: params.realm,
                clientId: params.clientId,
                tab: params.tab
            }
        );
    }
    return generateEncodedPath("/:realm/clients/:clientId/clientScopes/dedicated", {
        realm: params.realm,
        clientId: params.clientId
    });
};

// New role
export type NewRoleParams = { realm: string; clientId: string };

export const toCreateRole = (params: NewRoleParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/roles/new", params);

// New scope (authorization)
type NewScopeParams = { realm: string; id: string };

export const toNewScope = (params: NewScopeParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/scope/new", params);

// Scope details (authorization)
export type ScopeDetailsParams = {
    realm: string;
    id: string;
    scopeId?: string;
};

export const toScopeDetails = (params: ScopeDetailsParams): string => {
    if (params.scopeId) {
        return generateEncodedPath("/:realm/clients/:id/authorization/scope/:scopeId", {
            realm: params.realm,
            id: params.id,
            scopeId: params.scopeId
        });
    }
    return generateEncodedPath("/:realm/clients/:id/authorization/scope", {
        realm: params.realm,
        id: params.id
    });
};

// New resource (authorization)
type NewResourceParams = { realm: string; id: string };

export const toCreateResource = (params: NewResourceParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/resource/new", params);

// Resource details (authorization)
export type ResourceDetailsParams = {
    realm: string;
    id: string;
    resourceId?: string;
};

export const toResourceDetails = (params: ResourceDetailsParams): string => {
    if (params.resourceId) {
        return generateEncodedPath(
            "/:realm/clients/:id/authorization/resource/:resourceId",
            {
                realm: params.realm,
                id: params.id,
                resourceId: params.resourceId
            }
        );
    }
    return generateEncodedPath("/:realm/clients/:id/authorization/resource", {
        realm: params.realm,
        id: params.id
    });
};

// New permission (authorization)
export type PermissionType = "resource" | "scope";

export type NewPermissionParams = {
    realm: string;
    id: string;
    permissionType: PermissionType;
    selectedId?: string;
};

export const toNewPermission = (params: NewPermissionParams): string => {
    if (params.selectedId) {
        return generateEncodedPath(
            "/:realm/clients/:id/authorization/permission/new/:permissionType/:selectedId",
            {
                realm: params.realm,
                id: params.id,
                permissionType: params.permissionType,
                selectedId: params.selectedId
            }
        );
    }
    return generateEncodedPath(
        "/:realm/clients/:id/authorization/permission/new/:permissionType",
        {
            realm: params.realm,
            id: params.id,
            permissionType: params.permissionType
        }
    );
};

// Permission details (authorization)
export type PermissionDetailsParams = {
    realm: string;
    id: string;
    permissionType: string;
    permissionId: string;
};

export const toPermissionDetails = (params: PermissionDetailsParams): string =>
    generateEncodedPath(
        "/:realm/clients/:id/authorization/permission/:permissionType/:permissionId",
        params
    );

// New policy (authorization)
type NewPolicyParams = { realm: string; id: string; policyType: string };

export const toCreatePolicy = (params: NewPolicyParams): string =>
    generateEncodedPath(
        "/:realm/clients/:id/authorization/policy/new/:policyType",
        params
    );

// Policy details (authorization)
export type PolicyDetailsParams = {
    realm: string;
    id: string;
    policyId: string;
    policyType: string;
};

export const toPolicyDetails = (params: PolicyDetailsParams): string =>
    generateEncodedPath(
        "/:realm/clients/:id/authorization/policy/:policyId/:policyType",
        params
    );

// Client registration
export type ClientRegistrationTab = "anonymous" | "authenticated";

export type ClientRegistrationParams = {
    realm: string;
    subTab: ClientRegistrationTab;
};

export const CLIENT_REGISTRATION_PATH = "/:realm/clients/client-registration/:subTab";

export const toClientRegistration = (params: ClientRegistrationParams): string =>
    generateEncodedPath(CLIENT_REGISTRATION_PATH, params);

// Registration provider
export type RegistrationProviderParams = {
    realm: string;
    subTab: ClientRegistrationTab;
    id?: string;
    providerId: string;
};

export const toRegistrationProvider = (params: RegistrationProviderParams): string => {
    if (params.id) {
        return generateEncodedPath(
            "/:realm/clients/client-registration/:subTab/:providerId/:id",
            {
                realm: params.realm,
                subTab: params.subTab,
                providerId: params.providerId,
                id: params.id
            }
        );
    }
    return generateEncodedPath(
        "/:realm/clients/client-registration/:subTab/:providerId",
        {
            realm: params.realm,
            subTab: params.subTab,
            providerId: params.providerId
        }
    );
};

// Mapper (dedicated scope)
type ClientMapperParams = {
    realm: string;
    id: string;
    mapperId: string;
    viewMode: "edit" | "new";
};

export const toMapper = (params: ClientMapperParams): string =>
    generateEncodedPath(
        "/:realm/clients/:id/clientScopes/dedicated/mappers/:mapperId/:viewMode",
        params
    );
