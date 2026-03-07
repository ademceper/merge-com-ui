import { generateEncodedPath } from "./generateEncodedPath";

// Permission Details
export type PermissionDetailsParams = {
	realm: string;
	id: string;
	permissionType: string;
	permissionId: string;
};

export const toPermissionDetails = (
	params: PermissionDetailsParams,
): string => generateEncodedPath(
	"/:realm/clients/:id/authorization/permission/:permissionType/:permissionId",
	params,
);

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

export const toRealmSettings = (
	params: RealmSettingsParams,
): string => {
	const path = params.tab
		? "/:realm/realm-settings/:tab"
		: "/:realm/realm-settings";

	return generateEncodedPath(path, params as any);
};

// User
export type UserTab =
	| "settings"
	| "groups"
	| "organizations"
	| "consents"
	| "attributes"
	| "sessions"
	| "credentials"
	| "role-mapping"
	| "identity-provider-links"
	| "events";

export type UserParams = {
	realm: string;
	id: string;
	tab: UserTab;
};

export const toUser = (params: UserParams): string =>
	generateEncodedPath("/:realm/users/:id/:tab", params);

// Add User
type AddUserParams = { realm: string };

export const toAddUser = (params: AddUserParams): string =>
	generateEncodedPath("/:realm/users/add-user", params);

// Permissions Configuration
export type PermissionsConfigurationTabs =
	| "permissions"
	| "policies"
	| "evaluation";

export type PermissionsConfigurationTabsParams = {
	realm: string;
	permissionClientId: string;
	tab: PermissionsConfigurationTabs;
};

export const toPermissionsConfigurationTabs = (
	params: PermissionsConfigurationTabsParams,
): string => generateEncodedPath(
	"/:realm/permissions/:permissionClientId/:tab",
	params,
);

// Dashboard
type DashboardTab = "info" | "providers" | "welcome";

type DashboardParams = { realm?: string; tab?: DashboardTab };

export const toDashboard = (params: DashboardParams): string => {
	const pathname = params.realm
		? params.tab
			? "/:realm/:tab"
			: "/:realm"
		: "/";

	return generateEncodedPath(pathname, params as any);
};
