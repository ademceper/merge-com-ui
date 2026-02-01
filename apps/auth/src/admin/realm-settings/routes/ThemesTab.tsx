/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/ThemesTab.tsx"
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

export type ThemesTabType = "settings" | "lightColors" | "darkColors";

export type ThemesParams = {
    realm: string;
    tab: ThemesTabType;
};

const RealmSettingsSection = lazy(() => import("../RealmSettingsSection"));

export const ThemeTabRoute: AppRouteObject = {
    path: "/:realm/realm-settings/themes/:tab",
    element: <RealmSettingsSection />,
    breadcrumb: t => t("themes"),
    handle: {
        access: "view-realm"
    }
};

export const toThemesTab = (params: ThemesParams): Partial<Path> => ({
    pathname: generateEncodedPath(ThemeTabRoute.path, params)
});
