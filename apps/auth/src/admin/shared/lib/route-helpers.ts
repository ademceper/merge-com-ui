import { generateEncodedPath } from "./generate-encoded-path";

// Permission Details (canonical source: ./routes/clients.ts)
export { toPermissionDetails } from "./routes/clients";

// Realm Settings
export type RealmSettingsTab =
    | "general"
    | "login"
    | "email"
    | "themes"
    | "keys"
    | "events"
    | "localization"
    | "security-defenses"
    | "sessions"
    | "tokens"
    | "client-policies"
    | "user-profile"
    | "user-registration";

type RealmSettingsParams = {
    realm: string;
    tab?: RealmSettingsTab;
};

export const toRealmSettings = (params: RealmSettingsParams): string => {
    if (params.tab) {
        return generateEncodedPath("/:realm/realm-settings/:tab", {
            realm: params.realm,
            tab: params.tab
        });
    }
    return generateEncodedPath("/:realm/realm-settings", { realm: params.realm });
};

// User - moved to ./routes/user.ts

// Permissions Configuration
export type PermissionsConfigurationTabs = "permissions" | "policies" | "evaluation";

export type PermissionsConfigurationTabsParams = {
    realm: string;
    permissionClientId: string;
    tab: PermissionsConfigurationTabs;
};

export const toPermissionsConfigurationTabs = (
    params: PermissionsConfigurationTabsParams
): string => generateEncodedPath("/:realm/permissions/:permissionClientId/:tab", params);

// Dashboard
type DashboardTab = "info" | "providers" | "welcome";

type DashboardParams = { realm?: string; tab?: DashboardTab };

export const toDashboard = (params: DashboardParams): string => {
    if (params.realm && params.tab) {
        return generateEncodedPath("/:realm/:tab", {
            realm: params.realm,
            tab: params.tab
        });
    }
    if (params.realm) {
        return generateEncodedPath("/:realm", { realm: params.realm });
    }
    return "/";
};
