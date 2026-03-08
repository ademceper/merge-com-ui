import { generateEncodedPath } from "./generateEncodedPath";

// Permission Details (canonical source: ./routes/clients.ts)
export type { PermissionDetailsParams } from "./routes/clients";
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
    const path = params.tab ? "/:realm/realm-settings/:tab" : "/:realm/realm-settings";

    return generateEncodedPath(path, params as any);
};

// User - moved to ./routes/user.ts
export type { UserTab, UserParams } from "./routes/user";
export { toUser } from "./routes/user";

// Add User
type AddUserParams = { realm: string };

export const toAddUser = (params: AddUserParams): string =>
    generateEncodedPath("/:realm/users/add-user", params);

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
    const pathname = params.realm ? (params.tab ? "/:realm/:tab" : "/:realm") : "/";

    return generateEncodedPath(pathname, params as any);
};
