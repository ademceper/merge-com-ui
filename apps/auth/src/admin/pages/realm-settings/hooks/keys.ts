export const realmSettingsKeys = {
    all: ["realmSettings"] as const,

    // User profile
    userProfile: (realm: string) =>
        [...realmSettingsKeys.all, "userProfile", realm] as const,
    userProfileGlobal: () => [...realmSettingsKeys.all, "userProfileGlobal"] as const,

    // Default groups
    defaultGroups: (realm: string) =>
        [...realmSettingsKeys.all, "defaultGroups", realm] as const,

    // Keys
    keyProviderComponents: (realm: string) =>
        [...realmSettingsKeys.all, "keyProviderComponents", realm] as const,
    keysMetadata: (realm: string) =>
        [...realmSettingsKeys.all, "keysMetadata", realm] as const,
    component: (id: string) => [...realmSettingsKeys.all, "component", id] as const,

    // Events
    eventsConfig: (realm: string) =>
        [...realmSettingsKeys.all, "eventsConfig", realm] as const,
    eventListeners: () => [...realmSettingsKeys.all, "eventListeners"] as const,

    // Client policies
    clientProfiles: () => [...realmSettingsKeys.all, "clientProfiles"] as const,
    clientPolicies: () => [...realmSettingsKeys.all, "clientPolicies"] as const,

    // Client scopes
    clientScopes: () => [...realmSettingsKeys.all, "clientScopes"] as const,

    // Localization
    realmLocalizationTexts: (realm: string, locale: string) =>
        [...realmSettingsKeys.all, "localizationTexts", realm, locale] as const
};
