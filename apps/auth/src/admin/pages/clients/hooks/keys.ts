export const clientKeys = {
    all: ["clients"] as const,
    lists: () => [...clientKeys.all, "list"] as const,
    detail: (id: string) => [...clientKeys.all, "detail", id] as const,
    sessions: (clientId: string) => [...clientKeys.all, "sessions", clientId] as const,
    authFlows: () => [...clientKeys.all, "auth-flows"] as const,
    credentials: (clientId: string) =>
        [...clientKeys.all, "credentials", clientId] as const,
    initialAccessTokens: () => [...clientKeys.all, "initial-access-tokens"] as const,
    keyInfo: (clientId: string, attr: string) =>
        [...clientKeys.all, "key-info", clientId, attr] as const,
    samlKeys: (clientId: string) => [...clientKeys.all, "saml-keys", clientId] as const,
    registrationPolicies: (subType: string) =>
        [...clientKeys.all, "registration-policies", subType] as const,
    registrationProvider: (providerId: string, id?: string) =>
        [...clientKeys.all, "registration-provider", providerId, id] as const,
    clientScopes: (clientId: string) =>
        [...clientKeys.all, "client-scopes", clientId] as const,
    serviceAccount: (clientId: string) =>
        [...clientKeys.all, "service-account", clientId] as const
};
