/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/KeysTab.tsx"
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

export type KeySubTab = "list" | "providers";

export type KeysParams = {
    realm: string;
    tab: KeySubTab;
};

const RealmSettingsSection = lazy(() => import("../RealmSettingsSection"));

export const KeysRoute: AppRouteObject = {
    path: "/:realm/realm-settings/keys/:tab",
    element: <RealmSettingsSection />,
    breadcrumb: t => t("keys"),
    handle: {
        access: "view-realm"
    }
};

export const toKeysTab = (params: KeysParams): Partial<Path> => ({
    pathname: generateEncodedPath(KeysRoute.path, params)
});
