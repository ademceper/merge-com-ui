export const ROUTES = {
    // Dashboard
    ROOT: "/",
    REALM: "/:realm",
    DASHBOARD: "/:realm/:tab",

    // Authentication
    AUTHENTICATION: "/:realm/authentication",
    AUTHENTICATION_TAB: "/:realm/authentication/:tab",
    AUTHENTICATION_CREATE_FLOW: "/:realm/authentication/flows/create",
    AUTHENTICATION_FLOW: "/:realm/authentication/:id/:usedBy",
    AUTHENTICATION_FLOW_BUILTIN: "/:realm/authentication/:id/:usedBy/:builtIn",

    // Clients
    CLIENTS: "/:realm/clients",
    CLIENTS_ADD: "/:realm/clients/add-client",
    CLIENTS_IMPORT: "/:realm/clients/import-client",
    CLIENTS_DETAIL: "/:realm/clients/:clientId/:tab",
    CLIENTS_SCOPE_TAB: "/:realm/clients/:clientId/clientScopes/:tab",
    CLIENTS_DEDICATED_SCOPE: "/:realm/clients/:clientId/clientScopes/dedicated",
    CLIENTS_DEDICATED_SCOPE_TAB: "/:realm/clients/:clientId/clientScopes/dedicated/:tab",
    CLIENTS_DEDICATED_SCOPE_MAPPER:
        "/:realm/clients/:id/clientScopes/dedicated/mappers/:mapperId/:viewMode",
    CLIENTS_ROLE_NEW: "/:realm/clients/:clientId/roles/new",
    CLIENTS_ROLE: "/:realm/clients/:clientId/roles/:id/:tab",
    CLIENTS_AUTH_TAB: "/:realm/clients/:clientId/authorization/:tab",
    CLIENTS_AUTH_RESOURCE: "/:realm/clients/:id/authorization/resource",
    CLIENTS_AUTH_RESOURCE_NEW: "/:realm/clients/:id/authorization/resource/new",
    CLIENTS_AUTH_RESOURCE_DETAIL:
        "/:realm/clients/:id/authorization/resource/:resourceId",
    CLIENTS_AUTH_SCOPE: "/:realm/clients/:id/authorization/scope",
    CLIENTS_AUTH_SCOPE_NEW: "/:realm/clients/:id/authorization/scope/new",
    CLIENTS_AUTH_SCOPE_DETAIL: "/:realm/clients/:id/authorization/scope/:scopeId",
    CLIENTS_AUTH_POLICY_NEW: "/:realm/clients/:id/authorization/policy/new/:policyType",
    CLIENTS_AUTH_POLICY_DETAIL:
        "/:realm/clients/:id/authorization/policy/:policyId/:policyType",
    CLIENTS_AUTH_PERMISSION_NEW:
        "/:realm/clients/:id/authorization/permission/new/:permissionType",
    CLIENTS_AUTH_PERMISSION_NEW_SELECTED:
        "/:realm/clients/:id/authorization/permission/new/:permissionType/:selectedId",
    CLIENTS_AUTH_PERMISSION_DETAIL:
        "/:realm/clients/:id/authorization/permission/:permissionType/:permissionId",
    CLIENTS_PERMISSION_CONFIG_DETAIL:
        "/:realm/clients/:id/permissions/permission/:permissionId/:permissionType",
    CLIENTS_REGISTRATION_PROVIDER:
        "/:realm/clients/client-registration/:subTab/:providerId",
    CLIENTS_REGISTRATION_PROVIDER_DETAIL:
        "/:realm/clients/client-registration/:subTab/:providerId/:id",

    // Client Scopes
    CLIENT_SCOPES: "/:realm/client-scopes",
    CLIENT_SCOPES_NEW: "/:realm/client-scopes/new",
    CLIENT_SCOPES_DETAIL: "/:realm/client-scopes/:id/:tab",
    CLIENT_SCOPES_MAPPER: "/:realm/client-scopes/:id/mappers/:mapperId/:viewMode",

    // Events
    EVENTS: "/:realm/events",
    EVENTS_TAB: "/:realm/events/:tab",

    // Groups
    GROUPS: "/:realm/groups/*",
    GROUPS_DETAIL: "/:realm/groups/:id",

    // Identity Providers
    IDENTITY_PROVIDERS: "/:realm/identity-providers",
    IDENTITY_PROVIDERS_ADD: "/:realm/identity-providers/:providerId/add",
    IDENTITY_PROVIDERS_DETAIL: "/:realm/identity-providers/:providerId/:alias/:tab",
    IDENTITY_PROVIDERS_MAPPER_ADD:
        "/:realm/identity-providers/:providerId/:alias/:tab/create",
    IDENTITY_PROVIDERS_MAPPER_EDIT:
        "/:realm/identity-providers/:providerId/:alias/mappers/:id",
    IDENTITY_PROVIDERS_OIDC_ADD: "/:realm/identity-providers/oidc/add",
    IDENTITY_PROVIDERS_KEYCLOAK_OIDC_ADD: "/:realm/identity-providers/keycloak-oidc/add",
    IDENTITY_PROVIDERS_SAML_ADD: "/:realm/identity-providers/saml/add",
    IDENTITY_PROVIDERS_OAUTH2_ADD: "/:realm/identity-providers/oauth2/add",
    IDENTITY_PROVIDERS_SPIFFE_ADD: "/:realm/identity-providers/spiffe/add",
    IDENTITY_PROVIDERS_KUBERNETES_ADD: "/:realm/identity-providers/kubernetes/add",
    IDENTITY_PROVIDERS_JWT_ADD: "/:realm/identity-providers/jwt-authorization-grant/add",

    // Organizations
    ORGANIZATIONS: "/:realm/organizations",
    ORGANIZATIONS_NEW: "/:realm/organizations/new",
    ORGANIZATIONS_EDIT: "/:realm/organizations/:id/:tab",

    // Permissions Configuration
    PERMISSIONS: "/:realm/permissions",
    PERMISSIONS_TABS: "/:realm/permissions/:permissionClientId/:tab",
    PERMISSIONS_POLICIES: "/:realm/permissions/:permissionClientId/policies",
    PERMISSIONS_POLICY_NEW:
        "/:realm/permissions/:permissionClientId/policies/new/:policyType",
    PERMISSIONS_POLICY_DETAIL:
        "/:realm/permissions/:permissionClientId/policies/:policyId/:policyType",
    PERMISSIONS_NEW:
        "/:realm/permissions/:permissionClientId/permission/new/:resourceType",
    PERMISSIONS_DETAIL:
        "/:realm/permissions/:permissionClientId/permission/:permissionId/:resourceType",

    // Realm Roles
    ROLES: "/:realm/roles",
    ROLES_NEW: "/:realm/roles/new",
    ROLES_DETAIL: "/:realm/roles/:id/:tab",

    // Realm Settings
    REALM_SETTINGS: "/:realm/realm-settings",
    REALM_SETTINGS_TAB: "/:realm/realm-settings/:tab",
    REALM_SETTINGS_KEYS_TAB: "/:realm/realm-settings/keys/:tab",
    REALM_SETTINGS_KEY_PROVIDER:
        "/:realm/realm-settings/keys/providers/:id/:providerType/settings",
    REALM_SETTINGS_THEMES_TAB: "/:realm/realm-settings/themes/:tab",
    REALM_SETTINGS_CLIENT_POLICIES_TAB: "/:realm/realm-settings/client-policies/:tab",
    REALM_SETTINGS_CLIENT_POLICY_ADD:
        "/:realm/realm-settings/client-policies/policies/add-client-policy",
    REALM_SETTINGS_CLIENT_POLICY_EDIT:
        "/:realm/realm-settings/client-policies/:policyName/edit-policy",
    REALM_SETTINGS_CLIENT_POLICY_CONDITION_ADD:
        "/:realm/realm-settings/client-policies/:policyName/edit-policy/create-condition",
    REALM_SETTINGS_CLIENT_POLICY_CONDITION_EDIT:
        "/:realm/realm-settings/client-policies/:policyName/edit-policy/:conditionName/edit-condition",
    REALM_SETTINGS_CLIENT_PROFILE_ADD:
        "/:realm/realm-settings/client-policies/:tab/add-profile",
    REALM_SETTINGS_CLIENT_PROFILE_EDIT:
        "/:realm/realm-settings/client-policies/:profileName/edit-profile",
    REALM_SETTINGS_EXECUTOR:
        "/:realm/realm-settings/client-policies/:profileName/edit-profile/:executorName",
    REALM_SETTINGS_EXECUTOR_ADD:
        "/:realm/realm-settings/client-policies/:profileName/add-executor",
    REALM_SETTINGS_USER_PROFILE_TAB: "/:realm/realm-settings/user-profile/:tab",
    REALM_SETTINGS_ATTRIBUTE_ADD:
        "/:realm/realm-settings/user-profile/attributes/add-attribute",
    REALM_SETTINGS_ATTRIBUTE_EDIT:
        "/:realm/realm-settings/user-profile/attributes/:attributeName/edit-attribute",
    REALM_SETTINGS_ATTRIBUTES_GROUP_NEW:
        "/:realm/realm-settings/user-profile/attributesGroup/new",
    REALM_SETTINGS_ATTRIBUTES_GROUP_EDIT:
        "/:realm/realm-settings/user-profile/attributesGroup/edit/:name",

    // Sessions
    SESSIONS: "/:realm/sessions",

    // User Federation
    USER_FEDERATION: "/:realm/user-federation",
    USER_FEDERATION_LDAP: "/:realm/user-federation/ldap",
    USER_FEDERATION_LDAP_NEW: "/:realm/user-federation/ldap/new",
    USER_FEDERATION_LDAP_DETAIL: "/:realm/user-federation/ldap/:id",
    USER_FEDERATION_LDAP_DETAIL_TAB: "/:realm/user-federation/ldap/:id/:tab",
    USER_FEDERATION_LDAP_MAPPER: "/:realm/user-federation/ldap/:id/mappers/:mapperId",
    USER_FEDERATION_KERBEROS: "/:realm/user-federation/kerberos",
    USER_FEDERATION_KERBEROS_NEW: "/:realm/user-federation/kerberos/new",
    USER_FEDERATION_KERBEROS_DETAIL: "/:realm/user-federation/kerberos/:id",
    USER_FEDERATION_CUSTOM_NEW: "/:realm/user-federation/:providerId/new",
    USER_FEDERATION_CUSTOM_DETAIL: "/:realm/user-federation/:providerId/:id",

    // Users
    USERS: "/:realm/users",
    USERS_TAB: "/:realm/users/:tab",
    USERS_ADD: "/:realm/users/add-user",
    USERS_DETAIL: "/:realm/users/:id/:tab",

    // Workflows
    WORKFLOWS: "/:realm/workflows",
    WORKFLOWS_DETAIL: "/:realm/workflows/:mode/:id",

    // Page
    PAGE: "/:realm/page-section",

    // Realm
    REALM_SECTION: "/:realm/realm-section"
} as const;
