/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/UserProfile.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { AppRouteObject } from "../../routes";

export type UserProfileTab =
    | "attributes"
    | "attributes-group"
    | "unmanaged-attributes"
    | "json-editor";

export type UserProfileParams = {
    realm: string;
    tab: UserProfileTab;
};

const RealmSettingsSection = lazy(() => import("../RealmSettingsSection"));

export const UserProfileRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/:tab",
    element: <RealmSettingsSection />,
    breadcrumb: t => t("userProfile"),
    handle: {
        access: "view-realm"
    }
};

export const toUserProfile = (params: UserProfileParams): Partial<Path> => ({
    pathname: generateEncodedPath(UserProfileRoute.path, params)
});
